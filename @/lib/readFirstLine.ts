import { createReadStream, existsSync } from 'fs'

type ReadFirstLineOptions = {
  encoding: BufferEncoding
  lineEnding: string
}

// SOURCE: https://www.npmjs.com/package/firstline?activeTab=code
export const readFirstLine = ({
  path,
  usrOpts,
}: {
  path: string
  usrOpts: ReadFirstLineOptions
}) => {
  const opts = {
    encoding: 'utf8',
    lineEnding: '\n',
  } satisfies ReadFirstLineOptions
  Object.assign(opts, usrOpts)
  return new Promise<string>((resolve, reject) => {
    if (!existsSync(path)) {
      resolve('')
      return
    }

    const rs = createReadStream(path, { encoding: opts.encoding })
    let acc = ''
    let pos = 0
    let index
    rs.on('data', (chunk) => {
      index = chunk.indexOf(opts.lineEnding)
      acc += chunk.toString()
      if (index === -1) {
        pos += chunk.length
      } else {
        pos += index
        rs.close()
      }
    })
      .on('close', () =>
        resolve(acc.slice(acc.charCodeAt(0) === 0xfeff ? 1 : 0, pos)),
      )
      .on('error', (err) => resolve(''))
  })
}
