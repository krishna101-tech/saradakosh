import { classesReturnTo } from './classes-return.mjs';

// The only cross-origin destination is the configured private Blog root.
// Never accept Blog actions, deep paths, query strings or arbitrary origins.
export function authReturnTo(candidate, mainOrigin, blogOrigin) {
  if (typeof candidate === 'string') {
    try {
      const target = new URL(candidate);
      if (candidate === `${blogOrigin}/` && target.origin === blogOrigin &&
        target.pathname === '/' && !target.search && !target.hash && !target.username && !target.password) return target.href;
    } catch { /* Invalid targets use the Classes fallback. */ }
  }
  return classesReturnTo(candidate, mainOrigin);
}
