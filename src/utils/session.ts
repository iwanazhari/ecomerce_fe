const SESSION_ID_KEY = 'wp_session_id'

/**
 * Generate or retrieve a session ID for the current browser session.
 * Returns a UUID v4 stored in localStorage.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return '' // SSR safety
  }

  let sessionId = localStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_ID_KEY, sessionId)
  }
  return sessionId
}

/**
 * Clear the session ID (e.g., on explicit session reset).
 * Note: usually NOT called on login since backend merges carts automatically.
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_ID_KEY)
}
