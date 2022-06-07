import { decryptedEnvs } from '../decryptedEnvs'

type DecryptedEnvsResponse = Awaited<ReturnType<typeof decryptedEnvs>>

export const decryptionScriptFunc = async () => {
  const getStages = (envFiles: DecryptedEnvsResponse) => {
    const stages = envFiles.map(({ stage }) => stage)
    const uniqueStages = [...new Set(stages)]
    return uniqueStages
  }

  const getUniqueEnvFilePaths = (envFiles: DecryptedEnvsResponse) => {
    return [...new Set(envFiles.map(({ envFile }) => envFile))]
  }

  const getEnvVarsByPathAndStage = ({
    envFilePath,
    envFiles,
    stage,
  }: {
    envFiles: DecryptedEnvsResponse
    envFilePath: string
    stage: string
  }) => {
    const envFile = envFiles.find(
      ({ envFile: path, stage: envFileStage }) =>
        path === envFilePath && envFileStage === stage,
    )

    if (!envFile) return []

    return envFile.envVars
  }

  const fetchEnvs = async (body: string = '{}') => {
    const response = await fetch('/decryptedEnvs', {
      method: 'POST',
      body: body,
    })
    const envFiles: DecryptedEnvsResponse = await response.json()

    const privateKeysEl: HTMLTextAreaElement | null =
      document.querySelector('#privateKeys')

    if (privateKeysEl) {
      if (!privateKeysEl.value) {
        const privateKeys: Record<string, string> = {}
        for (const stage of getStages(envFiles)) {
          privateKeys[stage] = ''
        }
        privateKeysEl.value = JSON.stringify(privateKeys, null, 2)
      }
    }

    const table = `
        <ul>
        ${getUniqueEnvFilePaths(envFiles)
          .map(
            (envFilePath) =>
              `<li><a href="#${envFilePath}">${envFilePath}</a></li>`,
          )
          .join('')}
        </ul>
        
        <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${getUniqueEnvFilePaths(envFiles)
                .map((envFilePath) => {
                  return `
                  <tr><td colspan="2"><h2 style="text-align:center" id="${envFilePath}">${envFilePath}</h2></td></tr>
                  ${getStages(envFiles)
                    .map((stage) => {
                      return `
                        <tr>
                          <td colspan="2">
                          <h3 style="text-align:center">${stage}</h3>
                          <small style="text-align:center">${envFilePath}</small>
                          </td>
                        </tr>
                        ${getEnvVarsByPathAndStage({
                          envFiles,
                          envFilePath,
                          stage,
                        })
                          .map(({ key, value }) => {
                            return `
                        <tr>
                          <td style="font-weight: bold">${key}</td>
                          <td>${value ?? ''}</td>
                        </tr>
                      `
                          })
                          .join('')}
                      `
                    })
                    .join('')}
                `
                })
                .join('\n')}
            </tbody>
          </table>
        `

    const decryptionTableEl = document.querySelector('#decryptionTable')
    if (decryptionTableEl) {
      decryptionTableEl.innerHTML = table
    }
  }

  document.querySelector('#decrypt')?.addEventListener('click', async () => {
    const privateKeysEl: HTMLTextAreaElement | null =
      document.querySelector('#privateKeys')
    const body = privateKeysEl?.value ?? '{}'
    fetchEnvs(body)
  })

  // document
  //   .querySelector<HTMLTextAreaElement>('#privateKeys')
  //   ?.addEventListener('input', (event) => {
  //     console.log('event', event)
  //     const privateKeysEl: HTMLTextAreaElement | null = event.target as HTMLTextAreaElement
  //     const body = privateKeysEl?.value ?? '{}'
  //     fetchEnvs(body)
  //   })

  fetchEnvs()
}

export const getDecryptionHtml = () => `
<div id="decryption" class="container">
  <h2>Decryption</h2>
  
  <div class="controls">
    <p>Passphrases:</p>
    <textarea name="privateKeys" id="privateKeys" rows="10"></textarea>
    <button type="button" id="decrypt" style="margin-top: 24px;">Decrypt</button>
  </div>
  <div id="decryptionTable" class="container"></div>
</div>
`
