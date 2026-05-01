/**
 * Discord-flavored Markdown renderer.
 * Converts Discord markdown syntax to HTML for embed previews.
 * Handles: bold, italic, underline, strikethrough, code, code blocks,
 * spoilers, block quotes, headers, links, and Discord mentions.
 */

/**
 * Escape HTML entities to prevent XSS.
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Parse Discord-flavored markdown to HTML.
 * Order matters — more specific patterns (code blocks) must be processed before inline patterns.
 * @param {string} text
 * @returns {string} HTML string
 */
export function parseDiscordMarkdown(text) {
  if (!text || typeof text !== 'string') return '';

  let html = escapeHtml(text);

  // Code blocks: ```lang\ncode\n``` → <pre><code>
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) => {
    return `<pre style="background:#1e1f22;padding:8px 12px;border-radius:4px;margin:4px 0;overflow-x:auto;font-size:12px;line-height:1.4;font-family:Consolas,'Courier New',monospace;color:#dbdee1"><code>${code.trim()}</code></pre>`;
  });

  // Inline code: `code` → <code>
  html = html.replace(/`([^`\n]+)`/g, (_m, code) => {
    return `<code style="background:#1e1f22;padding:2px 6px;border-radius:3px;font-size:12px;font-family:Consolas,'Courier New',monospace;color:#dbdee1">${code}</code>`;
  });

  // Spoiler: ||text|| → blurred span
  html = html.replace(/\|\|(.+?)\|\|/g, (_m, content) => {
    return `<span style="background:#1e1f22;color:#1e1f22;border-radius:3px;padding:0 4px;cursor:pointer" title="Spoiler">${content}</span>`;
  });

  // Headers (Discord supports # ## ###)
  html = html.replace(/^### (.+)$/gm, '<strong style="font-size:14px;display:block;margin:4px 0">$1</strong>');
  html = html.replace(/^## (.+)$/gm, '<strong style="font-size:16px;display:block;margin:6px 0">$1</strong>');
  html = html.replace(/^# (.+)$/gm, '<strong style="font-size:20px;display:block;margin:8px 0">$1</strong>');

  // Block quotes: > text
  html = html.replace(/^&gt; (.+)$/gm, '<div style="border-left:3px solid #4e5058;padding-left:10px;margin:4px 0;color:#b5bac1">$1</div>');

  // Bold + Italic: ***text***
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');

  // Underline: __text__
  html = html.replace(/__(.+?)__/g, '<u>$1</u>');

  // Strikethrough: ~~text~~
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#00aff4;text-decoration:none" target="_blank" rel="noopener">$1</a>');

  // Discord user mentions: <@!123> or <@123>
  html = html.replace(/&lt;@!?(\d+)&gt;/g, '<span style="background:rgba(88,101,242,0.3);color:#c9cdfb;padding:0 4px;border-radius:3px;font-weight:500">@user</span>');

  // Discord channel mentions: <#123>
  html = html.replace(/&lt;#(\d+)&gt;/g, '<span style="background:rgba(88,101,242,0.3);color:#c9cdfb;padding:0 4px;border-radius:3px;font-weight:500">#channel</span>');

  // Discord role mentions: <@&123>
  html = html.replace(/&lt;@&amp;(\d+)&gt;/g, '<span style="background:rgba(88,101,242,0.3);color:#c9cdfb;padding:0 4px;border-radius:3px;font-weight:500">@role</span>');

  // Discord custom emoji: <:name:id> or <a:name:id>
  html = html.replace(/&lt;a?:(\w+):(\d+)&gt;/g, '<img src="https://cdn.discordapp.com/emojis/$2.webp?size=20" alt=":$1:" style="height:20px;width:20px;vertical-align:middle;display:inline" />');

  // Discord timestamp: <t:unix:format>
  html = html.replace(/&lt;t:(\d+)(?::([tTdDfFR]))?&gt;/g, (_m, ts, _fmt) => {
    const date = new Date(Number(ts) * 1000);
    return `<span style="background:rgba(88,101,242,0.15);padding:0 4px;border-radius:3px">${date.toLocaleString()}</span>`;
  });

  // Newlines → <br>
  html = html.replace(/\n/g, '<br/>');

  return html;
}
