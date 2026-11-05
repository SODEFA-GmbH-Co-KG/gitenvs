// Runs in the Next.js middleware (edge runtime), so no Node.js APIs here.

export const AUTH_PATH = '/auth'

// Cookies are shared between ports on the same host, so two gitenvs UIs on
// different ports need different cookie names.
export const getSessionCookieName = (port: string) => `gitenvs_session_${port}`

export const getAllowedHosts = (port: string) => [
  `localhost:${port}`,
  `127.0.0.1:${port}`,
  `[::1]:${port}`,
]

export const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export type AuthDecision =
  | { type: 'allow' }
  | { type: 'login' }
  | { type: 'reject'; status: 401 | 403 | 500; message: string }

export const getAuthDecision = ({
  token,
  port,
  host,
  pathname,
  queryToken,
  cookieToken,
}: {
  token: string | undefined
  port: string
  host: string | null
  pathname: string
  queryToken: string | null
  cookieToken: string | undefined
}): AuthDecision => {
  if (!token) {
    return {
      type: 'reject',
      status: 500,
      message: 'Gitenvs: No encryption token configured. Start gitenvs via the CLI.',
    }
  }

  // Blocks DNS rebinding: a foreign domain resolving to 127.0.0.1 still sends
  // its own name as Host header.
  if (!host || !getAllowedHosts(port).includes(host.toLowerCase())) {
    return { type: 'reject', status: 403, message: 'Gitenvs: Invalid host.' }
  }

  if (pathname === AUTH_PATH) {
    if (queryToken && timingSafeEqual(queryToken, token)) {
      return { type: 'login' }
    }
    return { type: 'reject', status: 401, message: 'Gitenvs: Invalid token.' }
  }

  if (cookieToken && timingSafeEqual(cookieToken, token)) {
    return { type: 'allow' }
  }

  return {
    type: 'reject',
    status: 401,
    message:
      'Gitenvs: Unauthorized. Open the link printed by the gitenvs CLI to sign in.',
  }
}
