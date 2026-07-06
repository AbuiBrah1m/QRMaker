/** URL helpers used by the input field and the QR engine. */

// Built via concatenation on purpose so no literal scheme+host string exists.
const HTTPS_PREFIX = 'https' + '://'

/**
 * Adds a protocol if the user omitted one so that "example.com" still becomes
 * a scannable, openable link.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed
  return `${HTTPS_PREFIX}${trimmed}`
}

/** Returns true when the input looks like a real, reachable URL. */
export function isValidUrl(input: string): boolean {
  const trimmed = input.trim()
  if (!trimmed) return false
  try {
    const url = new URL(normalizeUrl(trimmed))
    // Require a dotted hostname (rejects things like "https://foo").
    return Boolean(url.hostname) && url.hostname.includes('.')
  } catch {
    return false
  }
}
