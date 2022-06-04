import { createInterface } from 'readline'

// FROM: https://stackoverflow.com/a/54269197/5730346
export const prompt = async (question: string) => {
  console.log(question)

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const iterator = (readline as any)[Symbol.asyncIterator]()
  const result = await iterator.next()
  readline.close()
  return result.value
}
