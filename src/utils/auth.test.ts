import { describe, expect, it } from 'vitest'
import { getAuthDecision, getSessionCookieName, timingSafeEqual } from './auth'

const token = 'a'.repeat(64)
const base = {
  token,
  port: '3000',
  host: 'localhost:3000',
  pathname: '/',
  queryToken: null,
  cookieToken: undefined,
}

describe('getAuthDecision', () => {
  it('rejects everything without a configured token', () => {
    expect(
      getAuthDecision({ ...base, token: undefined, cookieToken: token }),
    ).toMatchObject({ type: 'reject', status: 500 })
  })

  it('rejects requests without a session cookie', () => {
    expect(getAuthDecision(base)).toMatchObject({ type: 'reject', status: 401 })
  })

  it('rejects a wrong session cookie', () => {
    expect(
      getAuthDecision({ ...base, cookieToken: 'b'.repeat(64) }),
    ).toMatchObject({ type: 'reject', status: 401 })
  })

  it('allows a valid session cookie on all local hosts', () => {
    for (const host of ['localhost:3000', '127.0.0.1:3000', '[::1]:3000']) {
      expect(getAuthDecision({ ...base, host, cookieToken: token })).toEqual({
        type: 'allow',
      })
    }
  })

  it('rejects foreign hosts even with a valid cookie (DNS rebinding)', () => {
    for (const host of ['evil.com:3000', 'localhost:4000', null]) {
      expect(
        getAuthDecision({ ...base, host, cookieToken: token }),
      ).toMatchObject({ type: 'reject', status: 403 })
    }
  })

  it('logs in on /auth with the right token', () => {
    expect(
      getAuthDecision({ ...base, pathname: '/auth', queryToken: token }),
    ).toEqual({ type: 'login' })
  })

  it('rejects /auth with a wrong or missing token', () => {
    expect(
      getAuthDecision({ ...base, pathname: '/auth', queryToken: 'nope' }),
    ).toMatchObject({ type: 'reject', status: 401 })
    expect(getAuthDecision({ ...base, pathname: '/auth' })).toMatchObject({
      type: 'reject',
      status: 401,
    })
  })

  it('does not accept the token as query param on other paths', () => {
    expect(getAuthDecision({ ...base, queryToken: token })).toMatchObject({
      type: 'reject',
      status: 401,
    })
  })
})

describe('timingSafeEqual', () => {
  it('compares strings', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true)
    expect(timingSafeEqual('abc', 'abd')).toBe(false)
    expect(timingSafeEqual('abc', 'abcd')).toBe(false)
  })
})

it('uses a port specific cookie name', () => {
  expect(getSessionCookieName('3000')).not.toBe(getSessionCookieName('3001'))
})
