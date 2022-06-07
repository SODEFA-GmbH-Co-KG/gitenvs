import { GenerateEnvFilesFunction } from '../../src'
import { main } from './../../src/main'
import { keys } from './keys'
import { Stage } from './Stage'

const generateEnvFiles: GenerateEnvFilesFunction<Stage> = ({
  resolveSecret,
}) => {
  return [
    {
      envFilePath: 'test.env',
      envVars: [
        {
          key: 'SUPER_SECRET',
          values: {
            production: resolveSecret(
              'eyJpdiI6InMrU041a0JZRTNCQ0RaK00zbXV4cVE9PSIsImVuY3J5cHRlZFZhbHVlIjoiQjRQTGhmRXljZVBmNzNVNEV0OE9lSE5GcWp0eFJ6ZjRTWEJRY0xXQWVvVT0iLCJlbmNyeXB0ZWRTeW1tZXRyaWNLZXkiOiJBZEJOWGdudU8rQVZnTWpHK1lzUHozdzUxMjJvNkR1UjhGRXhIbDRzZklQMGU1am1wT1RBMERXdjVNTnJ0SUI2RFhIdkFiUkJoZW95SEVTeXRDSjhBazBxK3B1U2txZzg1cE1QTk80YTV5R2xqTFVHWE5MQjIrdVd6OTIzZmN5NVZOZmx6ak5iZFh6Rmh3VDZEMTJvazlKbEUzam1JNUpTWko3WnJaa1VYa3NqSFBWUHFVbit0Rkl6ZEhiTldGREx1V2pBTC9vck5sakFlMHNPb25uR3dWNGRRd3dydWtOL0xyN2pVUHB4UkFQbTc4RkZjNE40eTlyRTBKV1VQSHpDMkFRaGZCOTQ3bXZ1NWdNNjRFR2srWUkySTBIelVYY0J0VzNtbU5LQ05CTFJDT2ljdndmSUZVbXNFeDRENXJ4Z1JPT3VTdy84cmJmWlJXa2YwaVB1bzl4STFTWlBqaWV1SkNvcFM0WkpsbUJQZ1g1Njh0T01GZC9RY0lZN2RxVlkzb2xyMEJHK3BUOUZxWHRCVHJ2MHBUTnNML3BTVE45MEljSnMwUWFxYys1WGZIaG40SDEvamppakFUK3cybm5GSkhaR0NseWt3NGNxRTlaZjFCUE1aTFFyY3NudTdsbU92YWNycEo5YjRZbkRRTGlmNHBja2dZS2tsV2VRMWlnc0w1aXdNTkpiM2E4dWZsUkxqOW5lS0Vzbm9KWFlSTkNtQmExdnNXQXlNR3BKMGpVcEoyQzJyTTNrbHpNVlpCWkg3RmtHUXhacnRuRkl6NkNha3NOa0VjaVFidmpwTlVHNUVQVEpndE5TS25ONEdOTU51VlZpd1dLNEhwN2x1RlJwajJSRDdhNWowdlVwWDFOZm93QjVnRXBQdTFIYytxclpMdGZPNEV2T0lpND0ifQ==',
            ),
            staging: resolveSecret(
              'eyJpdiI6InluWkp3bUlLQTJsZ2d5TjhMZjFZbFE9PSIsImVuY3J5cHRlZFZhbHVlIjoiekJpOW5zcFdrSStYTGJSRXlodUFUWVNDQTZ3bkp5T3ZXWm1pQ0RxN2FUMD0iLCJlbmNyeXB0ZWRTeW1tZXRyaWNLZXkiOiJCOHdncVdOSTEvOUxFR1J1bWRKV3AxZFVQWlliRVM5QlhGWXJZRGcrYkozOS9hTGtoeHVjRFdpNklHYytzNHl3aVZCSndFakxkTUJtVS9meWhBYlBTdmFmUXFxMjJnMnI4UVNvTG9sUGNBY0JOQnZmSVhWbGpRcTBYMU4wdURrU3Y5SmRsVHYvUHlEc3VhcytRZDRBRTVIUlpmSXA0U2liTWJteVpsMUdJZWo5RVFxVndtdzE1WUNOV0Z2dGVSWVBYaUkzQlBPQkVmTXpYb1gwc0VVVlNnU1NWcGR0VFB3VXBCYjYvUEtncldBQk95QTVkRWJubjhKNkRrSFB3Vnd6S1VERkcrSHNSd2puZGJxRG1hOGZabDI0Um5OUU9hZEg1aVJzT2hiZjV6RkRZcGtWK1E4Qnd2K0tsZnRVZkNFaUF1azI2OWxwdXdHWm9RbE1FSUpYMnY0Q2M4bnJuNkk5UWkyV3RrS1gydTd2T1pOMGE5bHdtcjkyWEduRTAyalREdGRMcU9tRXFrVnIrZTBBU1REbEFCV1RSdTBQWVczY2ZDM0N4NkNGYmFYYmVSc3hCTE5ab2xlUk1WYS9sUFdYTE4yVnNSOVFKaDVuUXEvdjFVdk81WTlXWWdYb1dyOVNva241cHpzWm1DRnUvcWJONjZSbGw5NXVvVTBDMDRLTlBod2pHSWN4SXUwNSs2Nm9lLzZ4KzM0TVRFZmJnUDJaM3pSZ0xLSkpJNTk1bDF5ZGIraWd3OVdTS2NWUG9CNjlkU3F5Y2VHZDZuRjNGRms0S2dlZitYYWxVMmJ5eGpoL1J6NXNudGhKWWVDcTVhdTV0bUg2ZXZaZDFBSG5kcm9xYXZSN2dwVWNJdGROS3VXMlkvaHBFdi9KV1VJcUh4VWZpSUFmSTNTR0tCaz0ifQ==',
            ),
            development: resolveSecret(
              'eyJpdiI6IjNNaWhOK05LNTdzMUZRUTIvWXRFOUE9PSIsImVuY3J5cHRlZFZhbHVlIjoiVCtPeDk0d0ZpQUtUdjVqR2d3S1MwRHo4KzNBRGFMK3UzU2xCaUxkWXlzWT0iLCJlbmNyeXB0ZWRTeW1tZXRyaWNLZXkiOiJQQ0JXYW9mVm82eVh2MHpkTDN6SlRJaXBmN2MwVjVPbGRDNmQ0MHJCUkNreDNyOXRiK05MQU1qVW1IUC80WjYrb0pwOFVnbkhhTkJxa3Y2UzhCR21vMzJtdUprVGttaU5vRzUxZEtwRnorTVFWR2JzQy9YQUpqUnBxc016UXRHaVlGV3dqUjE4TGVYNWNsWnREKzg0dGRLRlVUSDRPNzk0V0pKREttOGVybXErcFpIWHNxa0hrK3JDSGo0ZG13RGZHWFlEckIyYTJsVHpzbDE3aGV4aHJ2WkdIdzlSWEd6bVg3VmNtZU05T0NXSEhuR0d4dGdMdnpCWTFFVkxvaFpjaGVmZEQ2N1FNWFFPSXpuek1kM3dLMks2d1dBa3A0ZkVNNHY5TWpKN0FERXU4NWNXeTMwYzg5Z2haRmRuMEMzS0lRTVZvYnpJSlQ5SE9qakFYK0NkZXJtV081QksybnVoVnE1OXdYdkdvd1VwelpxK29SeDhSVUtrTWEvQnVMQnp6U3BJY3BKaUxqTTZianV0ckdjdTVRZCtCQXAxc0REUGFxTWR0ZVg5QzcrdzBPdFNxZHlJdHRlMWZYbEd1bFVyU1pwQ2t4ajd3U21Jelh6UE9oaEJCeGs1cDdlWStudC9BenhJT3NhcitLSUh0VGRqR0hpWlBrbnhWcEZrY2JIQ1dldmNCV0lubmU3YUgwdGtVNjdxUXk1MXVBSHZNdFZWU2lEQlFYL1pabGNTS0NGSjNiUFZIR1AySzVZOFhkbkhKNmM0SU9ycElkQUhiT1FtTDV5NFhmZUlYTndTZjlZam9qMWNGazVtUHpTZXdUMXF4SFVLVmt1WWl6S0xFR2RBZERQaTZyYWROMnNnRTZ1bkVlakJocDY3SWc3ZVRHZmFlczNDZXJZMmZSMD0ifQ==',
            ),
          },
        },
      ],
    },
  ]
}

main({
  generateEnvFiles,
  keys,
})
