/**
 * @fileoverview Custom Command Parser — 4-phase pipeline, dynamic handler registry, regex-based tag extraction.
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Repo root (to resolve variables.json when run from directive/). */
const CONFIG_BASE = path.resolve(__dirname, '../../..');

// ExecutionContext is passed in by caller (createContext from executionContext.js)

/** Standard curly-brace tag: {tag} or {tag: argument}. Captures tag name and optional argument. */
const REGEX_CURLY = /\{([a-z_][a-z0-9_]*|\$[0-9]+)(?::\s*([^}]*))?\}/gi;

/** Bracket syntax for phase-4 only: [choice], [lockedchoice], [$1], [$2]. */
const REGEX_BRACKET = /\[(\$[0-9]+|choice|lockedchoice)\]/gi;

/**
 * Flatten variables.json into a single map: tagName -> { phase, has_argument, is_bracket_syntax?, category }.
 * @param {object} config - Loaded variables.json
 * @returns {Map<string, { phase: number, has_argument: boolean, is_bracket_syntax?: boolean, category: string }>}
 */
export function flattenTagConfig(config) {
  const map = new Map();
  const categories = [
    ['guards', config.guards],
    ['modifiers', config.modifiers],
    ['actions', config.actions],
    ['placeholders', config.placeholders],
    ['advanced_logic', config.advanced_logic],
  ];
  for (const [category, dict] of categories) {
    if (!dict || typeof dict !== 'object') continue;
    for (const [name, spec] of Object.entries(dict)) {
      const entry = {
        phase: spec.phase,
        has_argument: !!spec.has_argument,
        is_bracket_syntax: !!spec.is_bracket_syntax,
        category,
      };
      map.set(name, entry);
      if (name === '$N') {
        for (let i = 1; i <= 9; i++) map.set(`$${i}`, entry);
      }
    }
  }
  return map;
}

/**
 * Extract all curly-brace tag matches: {tag} or {tag: arg}.
 * @param {string} raw
 * @returns {{ tag: string, argument: string|undefined, fullMatch: string }[]}
 */
export function extractCurlyTags(raw) {
  const out = [];
  let m;
  REGEX_CURLY.lastIndex = 0;
  while ((m = REGEX_CURLY.exec(raw)) !== null) {
    out.push({
      tag: m[1],
      argument: m[2] !== undefined ? m[2].trim() : undefined,
      fullMatch: m[0],
    });
  }
  return out;
}

/**
 * Remove from string all occurrences of the given fullMatch strings (for stripping phase 1–3 tags).
 * @param {string} raw
 * @param {string[]} toRemove
 * @returns {string}
 */
function removeMatches(raw, toRemove) {
  let s = raw;
  for (const full of toRemove) {
    s = s.split(full).join('');
  }
  return s.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/^\s*\n|\n\s*$/g, '\n').trim();
}

/**
 * CommandParser — compiles a raw string with tag syntax and runs the 4-phase pipeline.
 */
export class CommandParser {
  /**
   * @param {object} tagConfig - Flattened tag config (from flattenTagConfig)
   * @param {Map<string, (ctx: import('./executionContext.js').ExecutionContext, argument?: string) => Promise<boolean|string|void>>} handlerRegistry - tagName -> handler
   */
  constructor(tagConfig, handlerRegistry) {
    this.tagConfig = tagConfig;
    this.handlerRegistry = handlerRegistry;
  }

  /**
   * Run a single phase: find tags for that phase, invoke handlers, collect strips for non-phase-4.
   * @param {number} phase
   * @param {string} raw
   * @param {import('./executionContext.js').ExecutionContext} ctx
   * @returns {{ output: string, toStrip: string[], failed: boolean, error?: string }}
   */
  async runPhase(phase, raw, ctx) {
    const toStrip = [];
    let output = raw;
    const tags = phase === 4 ? this.getPhase4Tags(raw) : extractCurlyTags(raw).filter((t) => this.getPhase(t.tag) === phase);

    for (const item of tags) {
      const spec = this.tagConfig.get(item.tag);
      if (!spec || spec.phase !== phase) continue;

      const handler = this.handlerRegistry.get(item.tag);
      if (!handler) continue;

      try {
        const result = await Promise.resolve(
          phase === 4 && item.tag ? handler(ctx, item.argument, item.tag) : handler(ctx, item.argument)
        );
        if (phase === 1 && result === false) {
          return { output: raw, toStrip: [], failed: true, error: `Guard failed: ${item.tag}` };
        }
        if (phase === 4 && typeof result === 'string') {
          output = output.replace(item.fullMatch, result);
        }
        if (phase !== 4) toStrip.push(item.fullMatch);
      } catch (err) {
        if (phase === 1) return { output: raw, toStrip: [], failed: true, error: err.message };
        console.warn(`[CommandParser] Handler for tag "${item.tag}" threw an error:`, err.message);
      }
    }

    return { output, toStrip, failed: false };
  }

  getPhase(tagName) {
    return this.tagConfig.get(tagName)?.phase ?? 0;
  }

  /**
   * Phase 4 tags: both curly and bracket syntax. Returns items with fullMatch for replacement.
   * @param {string} raw
   * @returns {{ tag: string, argument: string|undefined, fullMatch: string }[]}
   */
  getPhase4Tags(raw) {
    const out = [];
    let m;
    REGEX_CURLY.lastIndex = 0;
    while ((m = REGEX_CURLY.exec(raw)) !== null) {
      const tag = m[1];
      if (this.getPhase(tag) === 4) out.push({ tag, argument: m[2]?.trim(), fullMatch: m[0] });
    }
    REGEX_BRACKET.lastIndex = 0;
    while ((m = REGEX_BRACKET.exec(raw)) !== null) {
      const tag = m[1];
      if (this.getPhase(tag) === 4) out.push({ tag, argument: undefined, fullMatch: m[0] });
    }
    return out;
  }

  /**
   * Run Phase 4 (placeholder replacement) on a string. Used when resolving placeholders in embed object.
   * @param {string} raw
   * @param {import('./executionContext.js').ExecutionContext} ctx
   * @returns {Promise<string>}
   */
  async compilePhase4Only(raw, ctx) {
    if (typeof raw !== 'string') return raw;
    const result = await this.runPhase(4, raw, ctx);
    return result.output;
  }

  /**
   * Full pipeline: Phase 1 → 2 → 3 (collect strips), then strip non-placeholder tags, then Phase 4 replacements.
   * @param {string} raw - Raw command string
   * @param {import('./executionContext.js').ExecutionContext} ctx - Context (will be mutated for modifiers/actions)
   * @returns {Promise<{ success: boolean, output: string, context: import('./executionContext.js').ExecutionContext, error?: string }>}
   */
  async compile(raw, ctx) {
    let output = raw;
    const allStrips = [];

    for (const phase of [1, 2, 3]) {
      const result = await this.runPhase(phase, output, ctx);
      if (result.failed) {
        return { success: false, output: raw, context: ctx, error: result.error };
      }
      output = result.output;
      allStrips.push(...result.toStrip);
    }

    output = removeMatches(output, allStrips);

    const phase4Result = await this.runPhase(4, output, ctx);
    output = phase4Result.output;
    return { success: true, output, context: ctx };
  }
}

/**
 * Create parser from variables.json path and a handler registry.
 * @param {string} configPath - Path to variables.json
 * @param {Map<string, Function>} handlerRegistry
 * @returns {Promise<CommandParser>}
 */
export async function createParserFromConfig(configPath, handlerRegistry) {
  const fs = await import('fs');
  const fullPath = path.isAbsolute(configPath) ? configPath : path.resolve(CONFIG_BASE, configPath);
  const json = fs.readFileSync(fullPath, 'utf8');
  const config = JSON.parse(json);
  const tagConfig = flattenTagConfig(config);
  return new CommandParser(tagConfig, handlerRegistry);
}
