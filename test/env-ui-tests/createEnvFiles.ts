import { GenerateEnvFilesFunction, Keys, main } from '../../src'

type Stage = 'production' | 'staging' | 'development'

const generateEnvFiles: GenerateEnvFilesFunction<Stage> = ({
  resolveSecret,
}) => {
  return [
    {
      envFilePath: 'path/to/your/app/.env.local',
      envVars: [
        {
          key: 'ENV_NAME',
          values: {
            default: 'EMPTY',
            production: resolveSecret(''),
            staging: resolveSecret(''),
            development: resolveSecret(''),
          },
        },
        {
          key: 'ABC',
          values: {
            default: 'EMPTY',
            production: resolveSecret(''),
            staging: resolveSecret(''),
            development: resolveSecret(''),
          },
        },
      ],
    },
  ]
}

const keys: Keys<Stage> = {
  production: {
    publicKey:
      'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUFyWXJaUWJMQUJSK21Fc1FQeGh4YQpJTTlVVTVEYXJyUWVxS0xjTkNlL3g4emRLL2ZOMDViMEd5eTVYZjU1R3VhVEo4bW1UMXNTaE9yUUp1N2RpQlVHCkNMZDllbzhpaC9TNC8xZnJaMS9IbWpES0d1Z1Y0bFVXdWoyQk5Gd05weVduNitLZ2VVSEhoYk05dlk2MW5nM24KRlN1dVVtS2hnbnhnRXRIcERvR3F5allqVW1NOFN0UWhDa0YwRG84S0VHZGNqdGZPMUtIMFlnVkFBTzl2UWQwaApWZWRhaFU5dGxaYXhpVkhjNXIvc2hKSE8rRDVrcEM3Sm5CSFdDNTV6MmZ3UjJEZzR4aFZJeFVkdlEwUWFmd2F0CjVnL0E0T2NPWW12Q0JrUDJIb1FobmFzdEVQTWNFK0dUTGJtYVVlWmsvT29Qd1pmMWo2cGdvK2tLRjRvSngrT0sKZkZNRUxhQ0R4NUltL1BMd294OUNtdFBka012dDdCNUtoVWxYN2daTm1oYks5a2FrMGlvcy9JOERvdnlNL2R3UwpNQlBXMlJWWXlNTXFhZmdHOGp5WEhKdlJCUUxFZHNzRHVOUVNHNklPb1BBNE5vUWs5NFQ5c0tmc0JUczRhanpyCmVxQWw3bjdMSHFPRW9xTGhDa21laStYdFhObWNDNVZ6YjlYS2RUb1Mzcm5IbDQ0c1dQeHFQZVozS1B6eDhWZmUKMFo3b3hwOTVFZkVSTEVmWE4yNXBuUVFDQjRKVjUzYjNYc1NYQlUyZWRhbGtuZ1RDVndIWUZpbzRQckN2QWtKTQpMWWdOSHAyYytLT2pRcEcwZTVJS3FPVyttVWhxSFhUVnRGRkltc2tLRkJXUm84dng3ejIreDNqcEc3RTduUnVsCkoyanUvb3BzV0dFVVNEQTNNQU5jYU1FQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=',
    encryptedPrivateKey:
      'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVktLS0tLQpNSUlKclRCWEJna3Foa2lHOXcwQkJRMHdTakFwQmdrcWhraUc5dzBCQlF3d0hBUUl2UGlTOTBZVWhESUNBZ2dBCk1Bd0dDQ3FHU0liM0RRSUpCUUF3SFFZSllJWklBV1VEQkFFcUJCQm01WmZOcUw5UXBSNEpiektHN3FMR0JJSUoKVU5oVEIrTklzK0R2UktyWXcxbVYwMTdJamVvWlhDcmxiVzdJZWNhSXN0Y01sZzJSbG8xc01lcVM2dWVSRStyNApNYUpEd043V2FvMzhjSkNVdWpRQmdLVkpyamFYZTNZR0lvTWJJUnhxRmErL21UYm5FU3pnQXJ6ejRtRzV2Y0FYCjZ3Tkxyd3NaeGh2WkQ1b3B4akdJOUE0Ukt4dkp0SHFpSmthNTlEOXNybVFyMDhwQ1BhT3N1WHlacmtzdlp5ODMKcDk3UWpZL2dGS09Wb1NMQTEvQnNGOVNJa0J5N1NDOVdBWjBxbysybkp3S3RZVkE3Q3FGM2ZKNXFNQjZTT1BuaQp4MWp6dXdrbW8rMXdmRnRvMnNxRi9RQWZEVTl6Qk00Rm5HVkVSaXg2NzRYZTJuektONWwrd1B6U1psQlIvMXd3ClE3eDZpc2ZvT0lGTjBaWER4MjEvTXc5VEtkb05ua2dzMlROMGRlTkszcFVqNHZOQ090a0d6WVpzR0p3THRpM0MKZDBUd1hrV2pXRXE3UGcvNTdDdXpOK1JlL2NySUNNZ2RYdWd2TGd0anVSdW9nM0E3RUtVcmM3bkFSdjNGTS9rTQpXOGJvOUdLVGc5Qi9iT0QxNnFVWFBLRHhUMUNCWmRrNWppOU9UZzdtLzBQdkpQcVlRWVdmc3dsNnpYTGdPNVhYCjVOTk1YWWE4c2lzVXVWQUVGWktKYzJvWkpWN3pHbnBHTnBQYTg2TzNHdXZIajE4NVlGazVKc0phUFdtNFBFMlUKbkhWc2c3ZmJiTEFtYmlRK2ZuREtvdEN4bC9RTkdXN050WHdXdmRZZUNsRHgzOVUydThrVVRIUmIzd2ZGRjdSSQp6YnNtYm45bzNuZ3NjcEFpakFZSUp5L2tqeStmdERHaDEwdzR6MWNMaWw4Vk45eVlZU2RnL3A5WHNkd3UySW1FCnBSZzFlV2FZOHUxRTVvQ2tLZmt0ZUZkNXpoZko4bEFIdUQ0SXNsQUZXdS92d0t6bC9BT0s0QndJdGZSMnU2TVQKQ2hYTTdOeDhXU3VrOEx1ZStGK2JoUzBjVC9WUXBTRE81cTNZK1RTV1h0N05TTWk5OTM5YlpyVGdyQXNqWG5VLwp6VWk1eXQzTTEySHZrLzNlMnZFbng5SHh5MTZ4Z0pZdzhUVDd2cVY5RzJPZzRobVBEOG9LeU9lMm9RTUFqb0xoCnJTUzFqZ2R4YmhMZ3FHazRINEI5TXNQNXFFZGZLYTQ4OEc0Rm96U0RQZXNvbjF0NXc1Q3pjUThRV3dMc1ZHRTIKNzBNYTBYZFBac2hmclMwNDRZM3JLV0xJOTBRQVNFMXV4dGxBckVGN2cxbENuUHhpSHNnd0FNd1FUbllmajN1cgpYRGpJbmlPZlhBT1c1Qnh1cnF1RVExOGF3cFNDOC9pMm9vOWlBUWtXSkZYMTM5RlkzM1hNNVRlU1IrZlQ2UFljCm1NK0hwcXZuSHhTV1FnYmxvTVRWUEY2OGRkL1NKNUpvUzdCTmIxeXhPaFNlMUZwRDFoRGhNcFBDTDR1TGlNRzQKTXNNMXJsb3BKeVhrdjNqQ1hFR2lScmg1M0ZKRlBHK3FXSUROSWZnVkJ1SkN0VHNzejNHNDgvUmZpZFRkZWpWZwo1eGNDbkhkakNleVNCY09NbXBDcG16NW9ETjV4N2VBRWRKWk5SUTJNM1ZjejVLbTJSN3lEUnFxY2R0dXdVTmlHCm5KQmRHVlNBa2FhZlN3ZXJEckZrZlorU2Vkb3F4NDZlUWVKeTFMUmhDelV4N0J2djlqdElrTFFyY2tmaUVwY1IKMWJQSmdRZ0g4SlpVR1dhWUFlbXFUSHZGQmM1dmF0eXg2bk5ocEZuYjJhcWdiZzVCMW81d0hReEZkNXVkb3VOagpGTldCREIxaTlqZm8raGpMdVdCK3BuS2ZQeEE5bWNSUXdMMW1WaEIvcTRPY2sxUWt6RmNHRTlrcVNDOWlaczBpCmtDUm94bUJwdVFycVllck9WQkJjeGIweldPZHZoOFFiNXBVUnR3UUNEZ2ZicUYySHlvOVREYlQ5eG54UG81VVMKUWJJTnhxTGFXYlRzVkR1bTdtYUt5WW1iYTN4a0thVUxXa09Zb08yOVF4VnplN0t3cTY4VUwyREt3bmowYXdHRwpsM1FvMkpaclI5MEM2bU41WjRuMjFyUFpLMXgwYjNsSUVGOERBZXhBUlFaU1p2Y254c0dHL0ViRVJmZzN5a3kyCkMyeGJGQVByN1RIMGJtQWNZRjc0bnhMUmRaKytIVzdyMHg2dmRmZ1kyeGt5TGpGZk5QbC9IenFwM3ZxRXp4TnUKclJPc091U3lJc1JHY2FJUmFxOVVsdG5NRE14c25qSHFDcFpaWnh5Z1Y5T2lMR3ZUK3RYM0ZCTm4wZUgrZUlJTgpPZy9LaGwyODdVZENZNWFXK0txd0hsaU8vVDhoTFpWQnp3THlxOXoxbXhoa29zUEVpUGpwNytUU2x4d05JSFFYCmozZThNMHJCajFIUWIzdjhCRjlyRi9FRUpZcnM4MzRVZnp2RXR4bjh5OU9QaDMyTE9OSXhucnZ0c3lqdTJqNWQKb2tIRCtxR2RRN1JWSTBZKzBSRjFqdkozckZjK1dqcWhpNHVzdWZYYnZnanFzZ0I4bzVQREJaeVdQVi9kMVpnMwp1WHpOVWI0VkplTkdSb21kWmJBTW9uRG53a2xjMHFQekNaUnNoV0FvMjRpUlRmazA3M25NZHljdXZWaHY2YnZTClNzOEpVQXh1RDFGT05jUUVZTkRqZ3hhK3h6V1dzZ09KYm5SNXpQZTA4MWFuQXNUallVK3YrejF0a3BxUWdpUEcKU2VtWERQcDhLVUdHay81cTlDZWkreU1XMXR5Y3ppMUZBNE5sVlJLNXRWaW5iMzR5akJjVktvSXFLeiswSEs1Ygp2S3Y1cDFRKzI0aG1jb0xSK1E1azNiejVObVN1eE9TSEtjQXNoUUxaYlhRMjk4Tk9iVit1aXhIV0NyNk5Ka1RTClV3R3JiWVNYYURmYU55UlQ4QVdSK1JiZXk4cWdGYk1nMzM3SzRPZ05QNjV5WWZVQ1l5bmprNWlVMzhvOFJyTUcKSUNrVG51NmFjZmdxTHJkV0NZWkdCUXlZcG9TTEN1anN1UlpUWTdCaG1KZ2J2ekRRUWhzSHFKRGttODlza1BRLwpkVlFpVm1PclhmK2VqRWlOU21CSk9WWS9mRW12b3lkbDY5ZXRwZkcwdlVDbDZNZU4xMlR3ZVY0VEU3SmphSVRmCkRnWldDeGZFM3pIUmJJY005cCt3NUpwRXZKUTdEcjY3cnl6a1hBak01TFczdVY2U1hVRC9DTlpvYlFMODBxOVIKQkZONmpMRXF5MHNPaXVBMVNTdlJZeG9tNTRxWHNtL016eTl2d203aHl3N0pYbUZXeG5aZW13QW9GeFZVWmlCdAo0cGt0VHFpSVVjMkRXU0tseG9sbDY0TFl2TUtScUZaUnhNUW5BVmpCR2M1eS95T2FJNkhXbHJBVWxPUEtZUUNyCkFrVmxBWWF0Sk01bVZOMTY1VFZlWlNBZ0VDM3BwRjY5Wk1zZ3VidEZyT0JLY2d3SFJQYWdZTU1YalYxWTNDZ04KNWQ4bHB4ODBYODlIVE9YRlFOV01nb3FBRFI3ODh4U0psWDk1eFlPNFJOZWRqL05RUllaN3F4UmF0M0xmcHpyZgpSNEdKMFluaUlWTFZpRnlXNUw2Wm9lQ0JWS0JjTGRLd0liUThmUjBXYkZCQUptQmlFNlRCNFU0VHQ2dTI5dVk1CmFnbmVlMjRUNS9XeHJ2Z0c0aENVbXVhTmpTRzMxRlBISnU3ZGgvTE01REd0OG9xRkY2SlpPN2cwQTIySW5NaTAKM3lGNkgzMVhLY2ZFVjJLbEp6S0t5TXJZRlhkZHhXeFZhYVhzQUVsVzh5bGtua05tVTl0MkoySmtuaFlHQWhNMAppMlJHNTRKNzFXQUd2bHVSTWNTaURUZytTamdDTFRaQ00rbjlENjh3WVVPb0RFeUREbFNtcXkwaXV2TFFYQ2tqCm9zcEpvM3VlekErSWtPU1F0UmpLNysrRXllU1NPQ3FhSzBlU3duYUo5c2dCZFA2c2hMekhJTVo1alR5NGVFRGwKVTgzWHR2aGt0QXZIRTZZV1psaElWT05kdGVQemlYSlJtMkNpNTdyYm5rV1lNRjdLR2p1NmZBTlA0SUFkajZRNQpsM0hVdTZxTHFYV3ozZ3ZXdGV6bmcxQ0R0WVpzS1VaMS9HbVR2cnpnWFZ2UQotLS0tLUVORCBFTkNSWVBURUQgUFJJVkFURSBLRVktLS0tLQo=',
  },
  staging: {
    publicKey:
      'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUEySnJidVpNalI0R1Z6bTU5My91Tgo3cUNBWU40RGdHS05mQ3N1YkVUcjJHLzk1cVA3dm1pbG9zcllpNUxEcitwdnlMMkV1K1g0TGlXMnF3eHhQalM0CkJwa00zOGpqTEFPS3JkMjFFaXIzNldMU2JTY0dyUHIvQzlES0JUbUh3eDJMdmhGOGc3NTVBVUUyUjkrRzIxWWcKcG1VMHFwM0x0MEpidTl5b3N1UmF3TjZxNm9ORkhNOHNFSUNjKy9QL0lGc2FOTkp5QlR1TWo3SW9ReTBJdE41cApZcm9yeDZ3S05BWmNZSXpPdzZ0Z2lhR3pPMHNGVzNJVlZQWmNSNlJ4ZjFBWTNHa0plRWFaZS93aXBDZDFodUR5CmdaYmRmeUs1bWpiU2U0cjZPUjA0UmpTZVkvL1QrRHVCeGh1MlY2V3dEU1VjSUs2U2hNODVEMzRMT0lvblpsUXYKMGpNOUdlQjhIREQxdW84RWdjM2NrVkpuUmNVU3FVRTBPUXBsYWJ3aUtUMzFZQXpZdUFBbVBqV1N4MlBnTG1IWQpUMSttQkJZY0xpZldWVmNHblVQUm8xTnVRZ1l3QVRHeXZvMk1XSVFTaXdzeDVHWDlqb2RjV1Q2R2YwZmw0bWhhCjJnQ29NR2JCbnl4OGp1Ny9jNTNRMm16TXJsVktvTGkvQlFDYTNlU25VZ0JNNWxuUzU1OEpocTUwZ2g5REtJTXAKMjd3Zi9xbnBMVGZBQmoreXhYdkNSdFBRalMxQUlCWkJvRlIvUVJtcHFTb2hZRDhIaVoyMlk4MEd5dkNYai9IbQpicUpVbmxEcEpWeHFYQUxkRGtOYnBJWWkyUW1lZm1kWUV0cXFuYkFoeXZwRHkvY2QzSHFqV3RwaFZnMDRnOEpzClpUclRHMkJWT0tEVlNJWUNpVnc1SG9NQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=',
    encryptedPrivateKey:
      'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVktLS0tLQpNSUlKclRCWEJna3Foa2lHOXcwQkJRMHdTakFwQmdrcWhraUc5dzBCQlF3d0hBUUlJUmdmN3owQmNFNENBZ2dBCk1Bd0dDQ3FHU0liM0RRSUpCUUF3SFFZSllJWklBV1VEQkFFcUJCQjBJeW1qODRZQjFncG9QN2lidTVyeUJJSUoKVUM3NkNOeDhVRnJNdGdzVmlTNTlhRnBCa3VBdnBlWVo2L1pRZjVVcTRTcXVha05xbXJjaDZjcFlpTmo3R3h1cAowZGJuL0p1ZEw2ZUErejJFazFhN3p2amNjMHFWNi9rcGdwREVBVWFtUmFJanN6ZXd2TzVuK2NybnNaMTRvRkNXCmE5WklpRThFc3BiOWFld1BwZHQ1ek5CZ1NiMDZla09OSnRmdFNtWFZya0grVmNPNDA0U1NRMWpPZ2dlZGZ2T3MKSDZCNHJvbW4wZ2xMNWJ3MUFqNFJvMitRZlNOUVlsbHo5UC9SdzN0WVVoZjdwczZPMFU4VHcxekdFMDd3YlA1SQpDaXZVQ2ROam03ZzlOVml0MVFnZ1lVbnI1bHpqaTdOS2NMdXdOdmlNandDREY4MVBjcFUzWXJ3ajByOElQUWxLCkg0RUliOGt3TVZ0Sm0xd0s4Q3VwMU04SDVrM0dnTnppRzBLd09aelZCakw3WjVZOFhBdWFMbmFMR1Y3aWVrTmEKYXhsOEN1d2hscE5CRTk4aHpaOWJBb2FaUGhHY0IrMHJGLzdvN2xjZldVejc3Y05GNnoyUGxmRTBqS0U5VDhGLwovSS9hRXQ5UTVGY0QvamgzOTFlaVQzU2Jid1JEL0hOcWIvdThTSFhvY3M2WFVnUFRQZjM2akdMZktaQ2JnTFBRCmhQUFhpMmdKZnk1UHJyelBCNXNMN0RLeFBhUzNDdlVSL3h5YlVqTkZHOUljUGxWM0tQQ0tCR2VYR1N2TjBsMjgKVGZpLzNvV1VjalJOZnhPbDdnd1FjdDlzcUVGeGVhMk00b2taeDdvb0JDa295b2thbHhmR2k5TlVqd1RjNkYzegp3RnEzWWVaZGNpaGRQYlByTFBQdFdKT0xqR0VkRTFMQVoxYWRhSjhzZVNoSEJQT1J3REtpc3J0aUlBclBMaTZUCkFSbXQ3ZVUzeTRIRUNuQ1BZY21sdU9QcGI0dHdGdW9aSXkrVzFwbjlMQ2ViajFtMVkxRWtNQWljSi94YitNdGEKT1cxRGhQcmFBckkrTVBPcGJoK2FBV2VadmdZU1hmdEdiVFc5ekwvQ2cxSGVOSjh5TXVhK082bm1oUVBxdTFJUApFaU03dVlSUnZoMDBqNzRNSkg5NXpTWG4rVFUxVXlRQzkvWU54bGZ3UC9MeUw2WUNHUVFlQm1SQW1SeWtpREwrCkprVkNxNHFIVmVvbGRYQ0hVditzRUtyYll6WVpQK3d6SFpORWIrVCtwd1lxcGJDZWFBdG9QM0E3L1NaSUg3K2sKSmtrVmRZUkNJYkVUN1R2Q3kwTlNHMFptMVNyQVIxMFhEUTlGM29nKzU1cWltNlNSOE5GWGlMeW80M0VwZTE1bgo5ZElmdDViK3RvbXNGY2E4OFlrL05jTnVKVThSTDBEdUsyemlNakVHTGthMXFIQ2pUM3NDWE1ONlJBOXFNN0dWCm5YKzl1Nk5zVVVXYTdtUEE0L2dacjhZQXQzem03dDB4MGVYV3hGeUU2VFVsNktWeW5FN0VVTTRnT2RYUWtreVAKYXlPaVljVVU2MXg2SjJjcEFLamp1Mm5NQm1NNFpLSW9XalNxVXFJSHJhSm9CZzBFMFJvbGpWZDZWSERCUmtoTAppaDJnUFZVWTVteFpWelhzeU1mUit3Z2ZVV25Kc2dpdGp1TUoxQjE4ZktEVHFid3NGYlF5bGM3OU8vdVhiNWJaCmhKRmR6WVlybnJJRWUyejlCbFpVNm41ZnYwUmNJNlUyT0MrK0E3QVZUVVZmRmpmNVQ2ODkzYW9uSkJkaG1jdGQKZ2JmRHd1S2dXQWlrRmgzaXdiZDNmWXo3NXZvSXZTRzdUTFZNM0tSSlRpYkFlNllnc2I2NkxiL0FVMTNla2pFVwpOa2JCQjRCQlpHeW5EcElUbWxpN2s4VWxWWW5nT3paL1l3R1NDbWYrN2JCQ3dSK0RDU3I4QzVJeXBPT3hFa3hTCklDRWNjWHV4Wkw2UjZhUEJGcTE5SUhvaFhjSE9PaFhKWmR1djFPbllQTXlhRnRQUWlDSTVWRXZ2bDJkSXdQSTIKbmNYZmFQMlpOWGROYU9kSHAyUTJ3dDNSV3liMWRwVGJCRERQMmRVVUJ0TEt1QnNpVW5hcjZqcjhodWpoUFJDcQp4eUxRdFlMZVg3bGtzMXliODFYWmJoZSt6b2dtNzRQU3NybFd2TksvbWloNXlnQ2VwTGpwVmNXcTIwYi94Q1k4ClBRYVRxcUIrbHA2YllkNjV5OUV0TW4yMkJpcE1KZGJVUFlwd2QxQ2xSUDVCSS9HZnlxZ2RSclVVaDBQam1zWG8KNXc1d3F0czB6cTJZMjd3ekFPYUMwNCtxSE5sVjUzZFdMYmkxQVdtbHdvd0x5Z1JQTFIybHJIN0JnZWRJbEN3WApoOHdTQklna3Jhd0h4TFUyTXNLaHpmVmVEbGFRaDNacVNsbithSGZXZ05Wc1hoZzRza0JXaVdTWG93YU1kTTJWCm9HTXljQ2pVNmxmWmdiSnNXZ2ZrQmFQYlBMclJUTER5T3hlS0tMOE81ZlFaZDVnYXREWGtzWW9YcUxBYWRuVFMKYXkxVFdzZUxkaTRPa1JidVJ3aTJkdnV6c0srQVJNQkNMMS9wSzRwUk5QL3phODFUZGpZNElKdXdZdW0zUW81SAp1R0p1a0t3WCs3aDIwTTFUR1NGQlhXNkpjU0dFRGRGTkkrWjFDb09QRWZDMWlYY0QyM0hwd1h3WjlzNjg2bkp4CmFlL3JnVUV1WXdMb0duZHdRaTZsVHdNdjA3eEtkRzNGaUhUTzFlRUM2RDhqc24zR1htOTRrdzkvYzBCeXhSMmIKR05TRXdBeTdDYUsxUGZuSVJzeDNzVzU2cTRFSXpYV3hCNC92VU1OYURKQzhDSkcrZmJ3WGl2WGZ2SHgrREJ3TgpaMEJpYXJIYUFuemFVdk9KTkVRQzVwcTU3bzkzS2o0OStIcWtVQzBqNDVPZUx2STNwYWpvYm9JbTFRL0QyL2VuCmFpZE8vYk0xdDdHU2VlNDZ0QmRtcHdQNSs4SmcxZmRXUHpRYUlDU2dXRlBDbVpkUEtYSitPNkQxWFpSKzNrbWQKZ1lYd3Rwak0xZ1Q5Sng0TVNGSWVzSTJWeTNQRkpDVTRmOHhqSDluRmFIa3JZNTFtWDcyWE9RdlJrSDhTZEMzYwp1d0lmS1UrZmdWK1dLUnRrYzRhQTBkOE95clVIcTZlcDkvL1p3bE9aRnRRam9aYjVJMTV4VldTaTBqTnJPa2Y2CmlSZEZGOE5oUFFWRmRMM0NSZ2w0NzBzd0MveXJMVGl6WGF2MVgySGlXcjZZUHFPV01HeWtVY3RUSzQvdVZFOVcKOUxlNjdNK2VrN0R6d2tXZkpLYnBqaC9jWXJNaitHTEQ2NXFnbnRweThTVm0zek51MHhLL3A3OGdtWS9YVmY2dAordUgxRnJzMVhpbXEwTVVHd2NFNzYySytraVlTWVFUSzh2K0ZFUy9WSnEzeGQ4aWdmSk1RTWpWemhheU9iRUFkCjhCb1BLdHdiVFI4SWRPeHBTUVV3TnVpMUZaZnZRV1pqdEQzV2pvVW93c1NqU3VSdCs2M3VCR0syVzIxRTBpL3QKeENwbEIrVkdNUG13MGRObUlxZDIvVEZXTEpVY1Q0U1I3TDJETjczdDNBS1hqRmxHY2paV0pBd0lRK2VNM2ZWdwo2MDFvTUo1MFp4OXhGMFFBbTJpY2RoVWZIWDgvZ0psVEg1VnN6aU42aEtiWHAyeEMvUlZPNWxtd3dEa1AzWTBWCnExeXVkbS8rMWw2WnVrVGYvWmJxMVZxRnZ5VXFWM2xMamV1UkgybGRaTURGbUxDVDJOb3B4L28yR3BVanpGZXoKdEVRd1p2eW42aXBmWUZXZnMwaEtYTHRTTTREZUhRS2pvQmpXRmh4QnQvYXBLeG5WZ1ZJOEFpYjVCTlFxL2psdgp1d1NuNVV6UzQwVTdQMElBTGRXVWpFTDVIU1p4dCtRdnBBK1k0bkFTenhyY0pKd2pUc1cremJEc3pTWmxaYXVQCmZOL0MxL2VwQlB2V2t1L2VWU3Z0TEM0RjBHYldEcWhaN3BNSEtIZlpFemRxWGVUakNvU2k1Y3JRWEhhYTk4QUMKZkorNkNXZ3RCWGcybi9LdTh2NUxRcUQ4bkdTeDRCWjNZYkVxV2NEc3VuaVhxZEN1SVdyUVEzUzJpMXNmWWpqYQpHdkxYUlNlcFRyOW9uT0d2aWZ1a1dKT3Fwc3o3NnJVcGIra3o2elNrQk0wLwotLS0tLUVORCBFTkNSWVBURUQgUFJJVkFURSBLRVktLS0tLQo=',
  },
  development: {
    publicKey:
      'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUEwdjBFWm5iSzBmcDJIS0VyY055YQo2UDVyd2tUc3lPd0tFSFphS004V2dUL0NPR3h5b293bGZNRHVuZEZqVXMxc3RjZXUwcXlKS1BKSmlwdHBpMWFpClRHQ0dRZFJWVmxoNERSTUpSZko1aFpHSk85WUVIOHAyS2FEaVNGSVpvUXI0NS9yRUFQKyt0NFVlL1AvekR1cEoKSWw5aVltdmU2Y3FBSS9UM2p4TGlmeXRDb3h3eHpaYjhFWnJmbXZiWDFQNzVhOFRhKzZFdmFKRldRajF1SXNOcApUMnp2VFdleDhRNGg4bGRMT3VuR05NNk5JanFBckVNMlBJL1FObVdsUEFTbytCWGdMZng5K3dFNE8rVzYxQ3hTCkYwMlp4bDV4TnZlTWFNR0xiNHRXQXY2M05CRmJUSVh5eVpzZWJHSmM1Y2xoTFFrSmNDRlBaS29ld3U2UEFmSHcKUlE4SVBWVlVxa0d4V1kwMEpzeFlDaVhVUEVZVWFEUW1NVGExM2F2cmRCS0tJYVkvL2xtWS9uclk0ai9sWXNWeApYRHZJRHQ4andyOUhPajBYNWJLaDBUcG1nZWFkOEIrUWJqa2gvQ3dqd3hFakNwMDhGOFRpTVdNMUh4d3p6QzNHCmdaVzBQZWZXVmdoaG10S0JzVXJGQ0pHRVUzVVNmam4xOXZQcWZMODhZYiswbzdZVGw5ak41L0crWDcyNThaSFkKQU1xMTEyNm01eGxCbzQ2Uy95OC9DWmhlZTBTakU4S21HNGpVcGpQTlhzejlKRlZtZHZONEpYYnpQblBnZjl5bApnY2lOVXlNRTVvUndEL0FkbG14WXUyang2VW5iY0YvdDE2TDhiVUxpUlphUk5nSVEyRm02RDl2SGpDNUI4c3FjCjhzSElaRkdva0hhenFrcnQzUUdxZ3hFQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=',
    encryptedPrivateKey:
      'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVktLS0tLQpNSUlKclRCWEJna3Foa2lHOXcwQkJRMHdTakFwQmdrcWhraUc5dzBCQlF3d0hBUUl5aHRlUDRPNUlac0NBZ2dBCk1Bd0dDQ3FHU0liM0RRSUpCUUF3SFFZSllJWklBV1VEQkFFcUJCQUFvTFZtKzdFcDlXTlRqUnI2eTFDeEJJSUoKVUs2bU5UWEo5ejlOZlJyaGF0UytRSUhidGtFVnFYejFQQUpIc2NhVTFJY2NYNG5qZUVibDVCWDc5NjZzaCt3aQpzL0lFYjhxbC83anVoYk9zcU9FTXhIbWVZdDN0QnhKRENsRGQydHNoNkRvaVN0QnlVVXpXREwxMEs3Y054bmN2ClcwTjJYR1NXb05ZTnBGUmlmZTUrT1pMY1lGblhmbVNHbis1dVBSMDZrWG5JbGZmM3R4UytiMXVCU0dBSjNiV2kKcE1sR3lYQk5XL0M1bkhEbDRST3ozTmNDbFJZZUk5aFB3eWpVd0pCNjhTRXVqanZ1bEZWdGtUc0lhSDNlc2F3WQpjeXRrNUtXNDR1eG5jTmVsU0ZWRXhhb1VGejExc3FhVHdlT1FXTUdKZG55ajRidkdmS2lBbkpHVndxZ0VOMENNClU5Q0ZDcFRlZEYvanIrYW9CemtYVmtJSCtSQjU1MzY5MUpFMWFreEtBSldGZThubGE4ZFhaZmtDcmdTd1Mra08KdThabVZvYlJNc3B2WTlKOXdMaDdnMDVZTCtMQnJseFoyc09HNlljSU1wSVgyb2VyY0VZakM5aGVLNWZZRnBpZgpRZVdvODNYRHpFZ1F0dlFFZ3Z2Z2RhQm94VnNXcnAzbVhqMktVaWszc3NWZ05tdVBBNmJyU0w3ME1wUmlWZFd4CmlZd0o2bzluRG1nREhLbm5WYjIxM1VxTlVPRXN6dVNaUk4xdnZLWUEveUU4ZjREWVpLME03RGNYY2V6UjQ5U0IKUllwc0g4TkUzOVlEVmsyRklVNzUrWVlPbnBOK2E1c1VyRS9zS3FwaVRxYko5RGhEbzVNQmVKQTd3a2QrUzBqSwpKTnhCYzZUK0tjVFRrMkcwajZyNEh2QnZUY0I3bDJvdTZxTW5PME1GdFRxei93RVFyMWdUSTNIREhjbkZRZm9kCkdvcjZwcldDQUJhYmdsVDNWNHdkRnBjTE13NVNBQjgyR3Z3ZVFzbmRzV0hkVFJJTmJIS1pVZ05NUEhub2dhZ1gKM3E1WEJCQ2xaa0I0dWJoOUpHakptbWMvZk0wRE8ySVRmWmovQkRJR3RpTmZ0VEJTUUJ6NytFQWFENlpGN2FuVQoyVjFVUG5vN1Z6UnpNV1g2K0E0bU16Wjc2M1F4dHNzdHBaeU5BS1BVRFpjdnhYNno4NzJob2pJSjB0d2lZdzZ6ClpDK0NPdHhORWVuRk5QWFF1bytRbkRkVEdjTml4eW1iWk9GSVRGTzNQUjdhM0xsa1c3UnpSTlRZY0RRUE5XYjEKdjJhQzk0U1JIcituOUFnQ2JidDc1NG5KYkdVVDBoK3JEVVI2c25UdnBHWFoyQ2JYUExsZ2lianhoVmVuNy8vagpkb3hHWUk3OHExS2ZqaU5nb3F1VG1JWkF6RTN3blBMTzRzZ0pxS0RheWVSWVR3WTluUitlc0tJUnQvdWJ2dGJvCmZndlBFVGVTdkdoRXBDUldscXI1cjcrOVk0WXU1TmhVYzMrcEMyd2JCNjREa2NndzcwNkxLeUQxR1NFVDJDNk0KZ1pmNk1BY3Z3S3Y1SXRvOXlBMkQ1cUZNdUJYVXFQZTE3eGV6aTNVSlY5RjR4dzRyWkFNWFhzWjdaZWIxSlRBeQpwSjYwR1Z0cVVDekdWeFVDMjAzWGZhSkZML2N5UjlVSnJVZFA3bWdkOTR6MG0xNWlkcnJqVU1SZVNKOURGNGZNCmdKNmdhT2JPTzhuWDQ5UkppcU1TZjQ2Y29oVmFhSGxtT2NEWWdtVENFWnlnb0llY25qYlhPRTR2RFFQazIrZ3YKSkRvUTBFck9KdUNONFpVQ3hmUE8xdUxwdnhHZm1zUGlZK1VQMW56RHNuRGRsdlpubjFLTGtkbk1wa0c3a2hvQgp6MHZ1SXhMcklGWkl6anpZeEN1M2xQUzVWVEs3dUtra0VaQ1JOcDRJMG4vU01JeVVZMXVENC9FWFkwcDNMV3hlCktiWXlCbytobHYyaXpTR2N0c2l2Q0Q0YzZpZHNSV05OaDI2bzhUWmdzeFJna3dsbXFlSEpLNnFFK1pUN0Ewa1kKclNiSEdlRU5yVmI2ZGZ3bjlCZ0RWQnVmTjVCVUhiWENNQVpaNkFVR0RtMTFTcGMwUVB2b2x1cVIyMTdtRy9TdQpTVFNWUGxqS2xoKzY5NWtZYmp6dkF6cUZMSmxyamZjMHhSU0s2SGJuRkpMNWdnNms3SEp4WGJ5ZnJQS3VBT2hFCjRZNDlKSnBmNG9EV0tOZWc2S3dUL0tCc2xkQzFtNXV5NXFQR2NjNWIxSWtqUjF3T3hEaHpHdDZkVWpQNjVoUlcKcU5yakZZVUYxcnQ1dTdoWXZXRXBQdSszM01qN0xZS0lPSG5zWkFDRnd4cGNCMVlqNngrdUVMcy9hYmFkbDZDVAowYUFFdVVLRzBsckJJQnpUN0lrYWs5MU9OWkZzZEx0bE9DaFZ4b1NpcmtJUHV1bGpJL0JOSCtoM2FKTlQzMWRECmVrZDU3Vkx2NmN0WTJlM0kySHkwVGZiZnVpaWtPQlFaWk05WHZpVG11T21YajBzemF3YklhL1ZRUHZoYW5HOEQKWnBVS2xOd29FNHlISVpHSXZvRnVQYjFUcFA5OG5qMGtvV2M5YXVyNEVBOUVqMTQxQXI3U2xtY1lYZ240elJJUgpwcndGbUxDdVJINmJIOWJRNXRYbG80Q0cvZkwweXo0QzNTeExTSmx5YldmVkx6VDgrZ2RpeW5lZXFPcWVPaUhOCk5kdzVEanBueVprcHB4aXBWMkRpUW5ZTlJlSjE4K1dMUGFlL1g1Q3k1SlBpLzBHbEIxZ2FaRzVrcmREWit1dkMKa0libGlGZ1FEQzlOTkQ1aUZRc0NZZE9kd3piK1NVWUV5ZWEycy9FY25RbWFDa3YveHNiOEoyaFovZlYya2pORQorTUV1b2RIY011VUM0Rkp1YUlXNDAwSTh2d214b0ZoRTA5b2VpTXdhUHh1dzRrZktrWllZeHNwaFVqSEc5ZTdXCkNWTEYwSDZhZ1N3UXhTSjk2YVlIdDcwSHpnOVJrb0F3WkJTbFV2K2EwSDhGTU9nYTFNVFplWEhxaVBoeGYra1MKMDZvQXEzVWpnV2YxWFNQdktVc3o2UGQxK3RIS3FuanNyMzRZeWR1NW8zNUN6aGxWMjhLeWtuSHVoNzl3TGdjOApyMFNwV1piMEFQOFFJUlJOTHVFbXVYWms2aUtKN0kwcWdKR21xMDcyNUlmcnh3cWFEc3ZvZkYyS2F6STRTNjFHCmxvcldjQ3JnSWpVVDY1eFpDQWpxcURjSFRuWmFiSDVsVlhFSGNrVmhXWm0wT2FncWptSW9ib1VEcnpKb1ZFa2MKUXA5bENnZU95T1JGNHdnNEVkU21yK0tCbDVCaVpBcG5vTzdKd3ZXbHQ5OE1OcFo4MzIxQnorRE5adWxnKzdlaQpUbHFkZXNqVWZyeS8weDNSNEU3ZEVWekRWNnJRYWFSWkJyclMxVy9aTjFwQ3dQUzhTUHZGc25mTFArbUluTk5lCmJiUzRZNkxNaW9kNWZBOTQxMU5WZklEUGt4blhSa05SZGFIL0M5b1dSSXBVdFhHUzk5TjNkQVZhUDNkajhtMTMKMXBPQ0lnc2VqZUNvK1RUejMxaEx6VFZhVUtQT2xoQ05LRXozMTVKU05QbXBWWW5DanBIcndmVURGWkxueVVFdgpGWm1lZ0pLbitHQlVWNXBuL04zOUZkcjF1RWR1Y0U5dU82Tm5IUUswNXNtbmJSNmpCWHNwSElZam9JTHRBdjhkCjRsaGl4cVJXOVRtZHpJZmdWai9sdWlIZUxoQ01ESEtpN0h0M0hzVTVNZFlGL2M0ZnJRZkdyQWZBaTJESVZ0MW0KUUJMbWRpOHo2d2F3aG1BVmdFNXFIYSt0ZHM0VW9USGtRc256TEdLK0tlTHRBSXdVTmxtT3dONzlPWldGb0Fabwp2N0h0V05SQWoyeFMwQkVNa0JBcUNESkZWVnB1cEpyc3U1SktpcHh4eENyTEcyMVpUNDlWcXFoMFREZXdZK0lrCmZvejBNQ1l6TmZhOHRTZk56K0Z5a0RteGFSOWdhWWptR3VQNncvWWNrZW1JWnY4ZEd2OGNnd2FsZzFDbVRjckEKRWoyU2tnYWsva2xpdXdVUEVaL3ZQQ0lSc2ZCdmQxQ3FCSE1iNkNsdkZ4TFR1eER4c2VzcjlSTDBlVmREb3VmbgpwMmhnV3hPMm5aZnJURjBJSng3SkV2V2Fwc3A4VHdtS1d3OVkwWHgxYktLNgotLS0tLUVORCBFTkNSWVBURUQgUFJJVkFURSBLRVktLS0tLQo=',
  },
}

main({
  generateEnvFiles,
  keys,
})
