import { IncomingMessage, ServerResponse } from 'http'
import { decryptionScriptFunc, getDecryptionHtml } from './decryption'
import { encryptionScriptFunc, getEncryptionHtml } from './encryption'

export const mainPage = (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Content-Type', 'text/html')
  res.statusCode = 200

  res.end(/*html*/ `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Git Envs</title>
      </head>

      <style>
        html {
          font-family: monospace;
        }

        .container, .controls {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          width: 100%;
          max-width: 1200px;
          margin: auto;
        }

        .container {
          margin: 12px auto;
        }

        table {
          border: solid 1px grey;
          border-collapse: collapse;
          border-spacing: 0;
          width: 100%;
        }
        table thead th {
          background-color: lightgrey;
          border: solid 1px grey;
          color: #336B6B;
          padding: 10px;
          text-align: left;
        }
        table tbody td {
          border: solid 1px grey;
          color: #333;
          padding: 10px;
        }

        small {
          padding-left: 12px;
          display: block;
          font-size: 10px;
          color: #888;
        }

        h2 {
          margin: 0;
        }

        .controls {
          margin: 24px 0;
        }

        .controls textarea {
          width: 80%;
        }

        hr {
          width: 100%;
        }
      </style>

      <body>
        <div class="container">
          <h1>Git Envs</h1>
          
          <hr />

          ${getEncryptionHtml()}
          
          <hr />

          ${getDecryptionHtml()}
        </div>

        <script>
          (${encryptionScriptFunc.toString()})();
          
          window.addEventListener('load', function() {
            var enableSort = document.getElementById("enableSort");
            
            //initial render
            (${decryptionScriptFunc.toString()})({sortEnvs: enableSort.checked});

            //on checkbox change re-render depending on checkbox state
            enableSort.addEventListener("change", function () {
              (${decryptionScriptFunc.toString()})({sortEnvs: enableSort.checked});
            });
          })
        </script>
      </body>
    </html>
  `)
}
