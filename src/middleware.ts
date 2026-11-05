import { NextResponse, type NextRequest } from 'next/server'
import { getAuthDecision, getSessionCookieName } from './utils/auth'

// Every request (pages, RSC payloads, server actions, static chunks) needs the
// session cookie. The CLI opens /auth?token=… which sets it.
export function middleware(request: NextRequest) {
  const token = process.env.GITENVS_ENCRYPTION_TOKEN
  const port = process.env.PORT ?? '3000'
  const cookieName = getSessionCookieName(port)

  const decision = getAuthDecision({
    token,
    port,
    host: request.headers.get('host'),
    pathname: request.nextUrl.pathname,
    queryToken: request.nextUrl.searchParams.get('token'),
    cookieToken: request.cookies.get(cookieName)?.value,
  })

  if (decision.type === 'allow') {
    return NextResponse.next()
  }

  if (decision.type === 'reject') {
    return new NextResponse(decision.message, {
      status: decision.status,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  // The client still needs the token as key for the passphrase encryption,
  // it reads it from the hash (which is never sent to the server).
  // A relative redirect keeps the requested host, so the cookie is sent back.
  // NextResponse.redirect would rewrite 127.0.0.1 to localhost.
  const response = new NextResponse(
    `<!doctype html><meta http-equiv="refresh" content="0;url=/#token=${token}">`,
    {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'referrer-policy': 'no-referrer',
      },
    },
  )
  response.cookies.set(cookieName, token!, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  })
  return response
}
