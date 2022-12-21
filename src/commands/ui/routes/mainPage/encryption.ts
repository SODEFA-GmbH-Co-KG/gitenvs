export const encryptionScriptFunc = async () => {
  const encrypt = async (body: string = '{}') => {
    const response = await fetch('/encrypt', {
      method: 'POST',
      body: body,
    })
    const data = await response.json()

    const table = `
      <table>
        <thead>
          <tr>
            <th>Env</th>
            <th>Encrypted</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(data)
            .map(
              ([env, encrypted]) => `
              <tr>
                <td>${env}</td>
                <td style="max-width: 100px; overflow: hidden; text-overflow: ellipsis;">${encrypted}</td>
                <td style="width: 0"><button type="button" data-to-copy="${encrypted}">Copy</button></td>
              </tr>
            `,
            )
            .join('')}
       <tr><td colspan='3' style="text-align:center" ><button type="button" data-to-copy="values:{${Object.entries(
         data,
       ).map(
         ([env, encrypted]) => `
        ${env}:'${encrypted}'`,
       )}}">Copy All</button></td> </tr>
        </tbody>
      </table>
    `

    const encryptionTableEl = document.querySelector('#encryptionTable')
    if (encryptionTableEl) {
      encryptionTableEl.innerHTML = table
    }

    document.querySelectorAll('#encryption [data-to-copy]')?.forEach((el) => {
      el.addEventListener('click', async () => {
        const result = await navigator.permissions.query({
          name: 'clipboard-write' as any,
        })
        if (!['granted', 'prompt'].includes(result.state)) return

        await navigator.clipboard.writeText(
          (el as HTMLElement).dataset.toCopy ?? '',
        )
        console.log('Copied to clipboard')
      })
    })
  }

  document.querySelector('#encrypt')?.addEventListener('click', async () => {
    const toEncryptEl: HTMLTextAreaElement | null =
      document.querySelector('#toEncrypt')
    const data = { toEncrypt: toEncryptEl?.value ?? '' }
    const body = JSON.stringify(data)
    encrypt(body)
  })
}

export const getEncryptionHtml = () => `
<div id="encryption" class="container">
  <h2>Encryption</h2>
  <div class="controls">
    <div style="display: flex; width: 80%">
      <input type="text" id="toEncrypt" placeholder="Value to encrypt" style="flex: 1; margin-right: 8px;">
      <button type="button" id="encrypt">Encrypt</button>
    </div>
  </div>
  <div id="encryptionTable" class="container"></div>
</div>
`
