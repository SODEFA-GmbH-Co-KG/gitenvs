export const decryptionScriptFunc = async () => {
  const fetchEnvs = async (body: string = '{}') => {
    const response = await fetch('/decryptedEnvs', {
      method: 'POST',
      body: body,
    })
    const data: {
      value: string
      stage: string
      envFile: string
      key: string
    }[] = await response.json()

    // group by stage and key
    const grouped = {} as Record<
      string,
      Record<
        string,
        Record<
          string,
          {
            value: string
            stage: string
            envFile: string
            key: string
          }[]
        >
      >
    >
    for (const entry of data) {
      const { stage, key, envFile } = entry
      if (!(envFile in grouped)) {
        grouped[envFile] = {}
      }
      if (!(stage in grouped[envFile])) {
        grouped[envFile][stage] = {}
      }
      if (!(key in grouped[envFile][stage])) {
        grouped[envFile][stage][key] = []
      }
      grouped[envFile][stage][key].push(entry)
    }

    const privateKeysEl: HTMLTextAreaElement | null =
      document.querySelector('#privateKeys')
    if (privateKeysEl) {
      if (!privateKeysEl.value) {
        const privateKeys: Record<string, string> = {}
        for (const entry of data) {
          privateKeys[entry.stage] = ''
        }
        privateKeysEl.value = JSON.stringify(privateKeys, null, 2)
      }
    }

    const table = `
        <ul>
        ${Object.entries(grouped)
          .map(([env]) => `<li><a href="#${env}">${env}</a></li>`)
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
              ${Object.entries(grouped)
                .map(([env, stages]) => {
                  return `
                  <tr><td colspan="2"><h2 style="text-align:center" id="${env}">${env}</h2></td></tr>
                  ${Object.entries(stages)
                    .map(([stage, keys]) => {
                      return `
                        <tr>
                          <td colspan="2">
                          <h3 style="text-align:center">${stage}</h3>
                          <small style="text-align:center">${env}</small>
                          </td>
                        </tr>
                        ${Object.entries(keys)
                          .map(([key, entries]) => {
                            return `
                        <tr>
                          <td style="font-weight: bold">${key}</td>
                          <td>${entries[0].value}</td>
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
