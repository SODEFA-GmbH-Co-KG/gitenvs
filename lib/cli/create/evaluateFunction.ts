import releaseSyncVariant from '@jitl/quickjs-wasmfile-release-sync'
import {
  newQuickJSWASMModuleFromVariant,
  shouldInterruptAfterDeadline,
  type QuickJSHandle,
  type QuickJSWASMModule,
} from 'quickjs-emscripten-core'

export const FUNCTION_TIMEOUT_MS = 1000
const FUNCTION_MEMORY_LIMIT_BYTES = 16 * 1024 * 1024
// Larger values let deep recursion overflow the host stack before QuickJS
// detects it, which leaves the WASM module in a broken state
const FUNCTION_MAX_STACK_SIZE_BYTES = 256 * 1024

let quickJsPromise: Promise<QuickJSWASMModule> | undefined

const getQuickJs = () => {
  quickJsPromise ??= newQuickJSWASMModuleFromVariant(releaseSyncVariant)
  return quickJsPromise
}

/**
 * Evaluates the code of a function env var inside a QuickJS sandbox.
 * The code only has access to the JS standard library (no Node APIs,
 * `process`, `require`, fs or network) and can only return a value.
 * Like `eval`, the completion value of the code is the result, e.g.
 * `Date.now()` or `(() => { ... })()`.
 */
export const evaluateFunction = async ({ code }: { code: string }) => {
  const quickJs = await getQuickJs()

  const runtime = quickJs.newRuntime()
  runtime.setMemoryLimit(FUNCTION_MEMORY_LIMIT_BYTES)
  runtime.setMaxStackSize(FUNCTION_MAX_STACK_SIZE_BYTES)
  const deadline = Date.now() + FUNCTION_TIMEOUT_MS
  runtime.setInterruptHandler(shouldInterruptAfterDeadline(deadline))

  const context = runtime.newContext()
  const handles: QuickJSHandle[] = []

  try {
    const result = context.unwrapResult(context.evalCode(code))
    handles.push(result)

    const promiseState = context.getPromiseState(result)
    if (promiseState.type !== 'fulfilled' || !promiseState.notAPromise) {
      if (promiseState.type === 'fulfilled') handles.push(promiseState.value)
      if (promiseState.type === 'rejected') handles.push(promiseState.error)
      throw new Error(
        'Returned a Promise. Only synchronous values are supported.',
      )
    }

    // Convert inside the sandbox so the result is the same as `String(eval(code))`
    const stringConstructor = context.getProp(context.global, 'String')
    handles.push(stringConstructor)

    const stringResult = context.unwrapResult(
      context.callFunction(stringConstructor, context.undefined, result),
    )
    handles.push(stringResult)

    return context.getString(stringResult)
  } catch (error) {
    if (Date.now() >= deadline) {
      throw new Error(`Timed out after ${FUNCTION_TIMEOUT_MS}ms`, {
        cause: error,
      })
    }
    throw error
  } finally {
    try {
      handles.forEach((handle) => handle.dispose())
      context.dispose()
      runtime.dispose()
    } catch {
      // Do not reuse a module that could not clean up after itself
      quickJsPromise = undefined
    }
  }
}
