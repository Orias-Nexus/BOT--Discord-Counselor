/**
 * Đăng ký tất cả handler theo variables.json. Mỗi hạng mục lớn = 1 thư mục, nhỏ = 1 file.
 */
import * as placeholders from './placeholders/index.js';
import * as advancedLogic from './advanced_logic/index.js';
import * as modifiers from './modifiers/index.js';
import * as guards from './guards/index.js';
import * as actions from './actions/index.js';

/**
 * Đăng ký mọi handler vào registry (Map tagName -> handler).
 * @param {Map<string, Function>} registry
 */
export function registerAll(registry) {
  const register = (mod, nameOverrides = {}) => {
    for (const [name, fn] of Object.entries(mod)) {
      if (typeof fn !== 'function') continue;
      const tagName = nameOverrides[name] ?? name;
      registry.set(tagName, fn);
    }
  };

  register(placeholders);
  register(advancedLogic);
  register(modifiers, { deleteTag: 'delete' });
  register(guards);
  register(actions);

  for (let i = 1; i <= 9; i++) {
    registry.set(`$${i}`, advancedLogic.argN);
  }
}

export { placeholders, advancedLogic, modifiers, guards, actions };
