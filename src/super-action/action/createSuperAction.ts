import { createServerContext } from '@sodefa/next-server-context'
import { isObject } from 'lodash-es'
import {
  getRedirectStatusCodeFromError,
  getRedirectTypeFromError,
  getURLFromRedirectError,
  isRedirectError,
} from 'next/dist/client/components/redirect'
import { type useRouter } from 'next/navigation'
import { type ReactNode } from 'react'
import { createResolvablePromise } from './createResolvablePromise'

export type SuperActionToast = {
  title?: string
  description?: ReactNode
}

export type SuperActionDialog = {
  title?: string
  content?: ReactNode
} | null

export type SuperActionError = {
  message?: string
}

export type SuperActionRedirect = {
  url: Parameters<ReturnType<typeof useRouter>['replace']>['0']
  type: 'push' | 'replace'
  statusCode: number
}

export type SuperActionResponse<T> = {
  result?: T
  next?: Promise<SuperActionResponse<T>>
  toast?: SuperActionToast
  dialog?: SuperActionDialog
  error?: SuperActionError
  redirect?: SuperActionRedirect
}

type SuperActionContext = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chain: (val: SuperActionResponse<any>) => void
}

const serverContext = createServerContext<SuperActionContext>()

export const superAction = <T>(action: () => Promise<T>) => {
  let next = createResolvablePromise<SuperActionResponse<T>>()
  const firstPromise = next.promise

  const chain = (val: SuperActionResponse<T>) => {
    const oldNext = next
    next = createResolvablePromise<SuperActionResponse<T>>()
    oldNext.resolve({ ...val, next: next.promise })
  }
  const complete = (val: SuperActionResponse<T>) => {
    next.resolve(val)
  }

  const ctx: SuperActionContext = {
    chain,
  }

  serverContext.set(ctx)

  // Execute Action:
  action()
    .then((result) => {
      complete({ result })
    })
    .catch((error: unknown) => {
      if (isRedirectError(error)) {
        if (firstPromise === next.promise) {
          next.reject(error)
        }
        // We already streamed something, so can't throw the Next.js redirect
        // We send the redirect as a response instead for the client to handle
        complete({
          redirect: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - next's redirect() is not typed as router.push or router.replace
            url: getURLFromRedirectError(error),
            type: getRedirectTypeFromError(error),
            statusCode: getRedirectStatusCodeFromError(error),
          },
        })
        return
      }
      complete({
        error: {
          message:
            isObject(error) &&
            'message' in error &&
            typeof error.message === 'string'
              ? error?.message
              : 'Unknown error',
        },
      })
    })

  return firstPromise.then((superAction) => ({ superAction }))
}

export type SuperActionPromise<T> = Promise<{
  superAction: SuperActionResponse<T>
} | void>
export type SuperAction<T = unknown> = (
  data?: FormData | string,
) => SuperActionPromise<T>

export const streamToast = (toast: SuperActionToast) => {
  const ctx = serverContext.getOrThrow()
  ctx.chain({ toast })
}

export const streamDialog = (dialog: SuperActionDialog) => {
  const ctx = serverContext.getOrThrow()
  ctx.chain({ dialog })
}
