// Redirect policy shared by proxy and auth pages. Never trust a request Host.
export function classesReturnTo(candidate, mainOrigin) {
  const fallback = `${mainOrigin}/classes`;
  if (typeof candidate !== 'string' || /[\\\u0000-\u0020\u007f]/.test(candidate)) return fallback;
  try {
    const target = new URL(candidate, mainOrigin);
    if (target.origin !== mainOrigin || target.username || target.password || target.hash) return fallback;
    const decoded = decodeURIComponent(target.pathname);
    if (decoded.includes('\\') || /[\u0000-\u001f\u007f]/.test(decoded)) return fallback;
    if (target.pathname !== '/classes' && !target.pathname.startsWith('/classes/')) return fallback;
    return target.href;
  } catch {
    return fallback;
  }
}
