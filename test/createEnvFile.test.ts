import mkdirp from 'mkdirp'
import { EnvValues, EnvVar, EnvVars, GenerateEnvVarsFunction } from '../src'
import { createEnvFiles } from '../src/commands/createEnvFiles'
import { keys, passphrases } from './helpers/keys'
import { loadEnvFile } from './helpers/loadEnvFile'

type Stage = 'production' | 'staging' | 'development'

test('create the correct env files', async () => {
  const generateEnvVars: GenerateEnvVarsFunction<string> = ({
    resolveSecret,
    stage,
  }) => {
    const files = {
      mainApp: `${__dirname}/output/${stage}/main.env.local`,
      helperLib: `${__dirname}/output/${stage}/helper.env.local`,
    }

    const secretForInterpolation: EnvValues<Stage> = {
      production: resolveSecret(
        'eyJpdiI6Ik5pSWs3M0NQUTBVTzkyR2RFakNtd2c9PSIsImVuY3J5cHRlZFZhbHVlIjoiSWFzZVhybG5CREtrZDNtZSt5NnU5QWhydjkzSC80VWNZMW5rTEs2aTFsbGJkcXB3NEZRU3hLYlRTQkhkTmZyMyIsImVuY3J5cHRlZFN5bW1ldHJpY0tleSI6ImdBRXRUcmJqS0w0UXR6Skg4SXFZVUkyVjdkTnRyWTcwU1MzakR1VVBEQUw0OHlOWVVXazVTMUp1Vkl0b1dUSUlzUWJWamFKeTAxaGUzc2h5aWdWV0M4U2ozbTdtWFpsK1NTZVB2TVF6ay9MVGsvTyttUXRDMUNPeWNkZThGbFdqWmkyQzZCVnpPNVdNMVZ2bTlTWGM0Yng1dXhPNW9YTUFpKytVcVpvZFBZM2YxZSt5VUE2SnU5dlNkTzNQbFZrb2lnSmx1OEJ5RG9YV040SE5oVzhRcnhZUDFGb3Vhc2hLYmZsczhxS2lSV3pyZkpYbjB3OVd1S0FlUnN1WHVOK0oxUjljdlVTQXl6Skcza0d1T0xTYkFndytMUExtKzVFQzRoRUJWanFKUy9tMUUvMCsxdEw2bjh4Q25TTDJFM1BUWXYxTW9LVUFDM3Nwa3VXRkpMejFiRW50azFvVm05eWF6alZSMG1JdUNMZnhjRHdJUEZCdWlFOE0xa0ZmVlV0aDRaMFRYUnROeEROL3ZpUFNHNGtFdDJvOHBWVExDVVYrRnJzWHE2RTdaeHVZWCt0TEJkZi9YY0svUEkzZytyWTdhaWFnVHFmbzQ2WFVZOWU0MXE4RTgwdWtFbGUra0FZU0xaV1NVa3lQR0ZNdng5VHo1VmxMR0g4aWFrQWhlTjh5RjhtSW9JMEkxbkdLQzFiZXFpQVJBall5V2pQdnFnVS84dUhPQVZ6WUJyUExzNjVaU0VQTXRrd3NzZHl0U2V3Q1ozMGFoTzBQRnF1QXkrcFkwNFI0Z2RSYm9kb2dkSzd3cG5udm5pQ1p6bW1FakE1VnR1eklucllDenNKdzFuY2ZGT3BSNENPS09WZzlJbzIwSGlmRnVLZlVuWU8rNFAzaVp3NTBTRXJPa1VnPSJ9',
      ),
      staging: resolveSecret(
        'eyJpdiI6IlZIcGt4WGk3NVNVcGM5RnJTSDVhSkE9PSIsImVuY3J5cHRlZFZhbHVlIjoiS2FTNjUxdFhIa0F6R05mN0dvYXorSTlyTWZ0TzRyajgxNkpiMWVFK3dnND0iLCJlbmNyeXB0ZWRTeW1tZXRyaWNLZXkiOiJCcGhsZFR6cUFhajBiYWwwMzJPQWhWYTE3VC9TVk80N0hFUW1MNDFVT0lhanBROWprL3ZXOGJGVVJ4ejRhTkJjckhSQU9BckJ5ZG12YWtzUGFIMWM1NnBYOUpVd0I0R2IzaXNNWVljaXdmeEM2QnAyYlIra285dExYY3ZOeWlmb2VudXJiVVFqbGdnV1YrV0RPamlxcDNLZXdiUFVsV1J4RE4yRDl2aDQ2RE5xblJiNHJCSmZFTXpZdkZMZ0VSRXRjOWhaalhrNHVyUWlXVzYrOHNKVGkvUlE0WStDMXAvVFBadGtTN3lLN09mS2J3YXhwQ1ZCM1NTSllXUlc3VmphdDdrYndKSXpzODJ3cEwrMUNuMkUvUHNsZ2w0NkwwQzU5OVpFL2hvaHFaVTJTZzV1dHkzeVJpZXI3L3hPRmx0Q1NOUE92ZWIxMHJlM0F2N05iZzdUbWNLY3hEcFVpZnBIeE12VWpVWE95NTIxZWgxcnJCY2VCbENGOTVPM1RHYzhOQWNWcWxsRWFQcjZ6ZDd4cVdnUjQrTjZpN1F1M2NUZFBqVWdLMDJrOGl1aERCMUFPQlh6RHdUcHovRGhDSlVDbUdkY2ZEUkN4VTQrdXdqQStQSWlJRTVpM24zR1pxck9VOCtXRU15R1hJaFZYWjgzTmZMWk9ZTkNPcktiZnQrWm41ZG12QURPNWNJNU80NVBuV0g0cldsaCtIY2JoVENXWTczK1dNcldTWFBFNlpNaDVnTEh5RTVJa01lYlhtL0ZVQTdWVGJBQk01ejc3b0ZtV3Uza0hVREhmSWVqTzRlLzlmU0c1SGpZUEY0MDVqV1JvdVVOaThhY1FhK05NYWpLcnQ3dW9jSXN2ZXY3UVFrZCsvVzhpWVJlTmpLUUhUeTVQa0pZV3lBZXc0dz0ifQ==',
      ),
      development: resolveSecret(
        'eyJpdiI6IjBTVCtJVU4veFcwdmlZWW9aZmtXZ1E9PSIsImVuY3J5cHRlZFZhbHVlIjoiQ0lxVnJKY1NQOEh4UFp4cGowUm9jQ25zMi9BRlFHbWJFMnNBM2dnV2tVZzlWRlNwMjRSVnBCdjZYd1JrcFFYTCIsImVuY3J5cHRlZFN5bW1ldHJpY0tleSI6IlBRNjVlU0xlbjRQSTRqTGRDMGczWHduZWVGWWwrU21MeEZFT0lyNFNpa0hzRTdJdWVrQWl6UTJYUkxpcFRMck9IZnNFV21UaHpMZjBYQXQzbWJORUY3eEg5VXMrUTVUano5bjByWGVtbEJRQ2pCdGZHMnluZFFsbHZGSlRPWXNMWFVyZjdJOVU3YjdaclZ3MzUzRCtQRW9sa2c2UjdFcktXenVrY0ZWZFNKVElYSUFGS1pNM1UyUGw5aVY2WFlZK1RDMzNiRnRiNS9EYXFRazZrOHlpT2xJajU0V2Y5VFRqNHlsTWVPOEsvWU83U0hsaGgzK2lMLzFUV1ZMQmlEMjJGaCtXeFRSakJlbGc3VkpoZm80dnhETEVtTko5YjdGL0lnRGZzWkxpNnFhUlhzWjYyREo2NEt0NGxKUVQrTDc1aXRIUmFURW5WSEJFRzhpVGtFQ3E5U3dheUZiVGpiY1VXdzk0aDRPdWdkUm1VNHgySUsxV2FoQ1pYM0kzSThmMjc3R1ZxNUFYTkh4VTBGTC9HSUZEdzlqeDVaczRsQ3BmbWxqNHBORFFscUJMSjZRdnd5Ty9sQXVyL3puM1NXbWNEbHhRTllsOTdHYmdQdmt6endtTG5jWSszTWhMM2FzenZZTnBMczE0eHI4L2R4MElJOHB1M0FPWXVPbVpqWlYrOXpnazhGVTdNQ3ZmQ3NxeW01ZkoyWkVGeW5pZFpJalI1TmwyeHZmd0daZ3BCQXlWdWpiZXV0SkY4U1JFOE9NQSs2cEh2YnNjRExHS29oSDErdjJxWTdPOEtmTk5yb2xockNuVCtWSmZ6WitHU2NxR05oUlVWbk5iejhGbk9aakdZTUl2WW5KTWlNdjNyMlBaaGJEd0lVSDByM1JlS1dwWUNjWjVpQ0h5OWVzPSJ9',
      ),
    }

    const sharedEnvVar: EnvVar<Stage> = {
      key: 'SHARED_ENV_VAR',
      values: {
        production: resolveSecret(
          'eyJpdiI6ImhqaG94Q2taWCtuTUlibDhXZGtLT3c9PSIsImVuY3J5cHRlZFZhbHVlIjoiajYwUCtzdkxwMldpWkpwSm1IL3lVcWl1akxRaEx0alR4OXJFK0V6Tm1jQT0iLCJlbmNyeXB0ZWRTeW1tZXRyaWNLZXkiOiJSQ0RDczFvdThZMkhQRllmU3RRbk9pSDA4VUhjL0FISWs2eU1pZ0JoVGQ3Qmx2bmVoMUpieHUzQ09DbmExZHdmakdhWkFXQTZMTXFmQ2ltVkFKcUhGODhPbzlGZnYyempTeWJDNkxLdFRWeDdWbWJTbWhjZlgwTG1tTFBJS3pjdFZhdlhnNUNKZjVOUU4yMmRwMnRvQ0FTamFqc3ZEd25KVTd1dndDQjRVRXBNMGFPcmRQb0ZQWjF1c2lrRkpjQzVrcVZqYUVMd2hsMVdGN01hWFYyNS9mK3U3NElncUJFMU0vRG1LbjZoL1JMQnN0dEVIZGpNaXJkZFdtYjJOWlRMMTRydUM2YVZsZWdIN3hGelJKRi84UVZnVVpvQU1RN2FrOEZSdlpoKzVkdnV0QmRxUUw3c1FXUkNZYStxTzNtTGFSeXpuQjhkQTQzejRQRTFvTG5YcUtITVZ3SGU3MmZGVHExKzg0ZEd5SUR0ME5Rc2dBUlY0cW5ibjcvYnpVZllQb2tlUzVJcHd1WHI1Ymoxbld4ZHZTQlhqRVZZdWZaMnhxTVljd1NBSS8wNGpHYU9RRnpzWFkzYTlJTXhleWg5RFo5U3M3anAzRVk4Qzd0V2cxNEdHZTJDc1lOYWw3dmE4Z3pnQjhuMFlmVURtWFBVYVo1SkdTRlllQ3haYW50R29oSDFUNGR3KzZUSDdyVDdSS0F2SEkvQlRza2MrQ2lwRHIrRUVnajBPWWFyY1ZDV29DbkNCVHR4bmI3aVRKSkFTbCtxM2M2TS9SMm1Ka2V4UGxYQzZpTVZkQllVQ21PRnpGVTlCSUlLQkh4OGl6UGhpSVUrM1NrU1U3UTdGL3FTMEtRNmcxZ1dneWROVzVRZko3UTNPUXdGQ1dHd2cyNUI0d0N0VkdubUsvST0ifQ==',
        ),
        staging: resolveSecret(
          'eyJpdiI6IkMzV0tmVU9xMmlhWHpVOXRiclZ1OGc9PSIsImVuY3J5cHRlZFZhbHVlIjoiYzg3U3ZRNk5acWt2ajRRSEJ6WFp1c2VZTGtDR2tLY3JzdTNJUXJGMElOQT0iLCJlbmNyeXB0ZWRTeW1tZXRyaWNLZXkiOiJwV1QrMU5od3Y5WWt4dlVacC9BaWxIOS90ZUllaTZVNXJVK2xnaVI5ODJxSDRlN3gvTUtTOCtpMy9Pa2s0bVlZMFo2dXFUL1B3aStYQXdjL3NoTWNrc05CTmhIb3NQWjVLdnJZaEp1RkJyektJYVZsaDQ1WXI0aHlMZXVaRFJ1WFZQRkxqc0RPViticU9lc0FyNUx1ZmVNemhEZmFoK0xXNkJKcERrOTI0TXFaUyszV1U4NmxQRW5XYkRTZ3NONS9aVzVGSjZiSjhMWURxRGY1aWh2Q2pCa0xmajYydHZIT2dnZ1NGZ1pERGpDWUJDMi9yV3JMN09IUlgyS2VSTktqekNMMXFmcDB5WkxJNEl0THNvVWVCK1M0b0U3dmtPUVZtZVloNmJPdzFYNFJKQkJTRlRUbDRYQUVvbG5QbTArK3pweWxvNC9sa01MSTQ4QlduVDZ5RTFMMkpNZ0NQeW1oK1g3ejJ4aVdJNVFJVVI4b0hLSDhBaytldDRBRmE2b3kreWZJM1g1aFhSaTEvc3dYNHhwQWRacjIreFJaOUJiQVhxYUF0TFZDTzhUeDlXeERBTU9RNlJqN1lTM01PeXUxcTM4Nmx3cmlydjhiY3hhaEFJV3J0RUl2c0hQVGFCbmsxQXlOTDYzSWc4YWVub2lmbDhVWlBZVzNXeDJHVWZRUldhL3kxemJJcXgwSG1ydVI3Snl3aG5BQzJESlVWOEhBWkJwMlFiNndITXNWVFVMWlF3T0FzRldzYzd1cWN1aWNzdm9MdXBLM2pJdHhMR2lpaTJBejRBWStDR3VZeSthM1hJT1g1blR1SjljV3JVUTNlcGNkbU84Q1F2SW04bWhPTVltcHFmNkllOGhTVWI0VDUvYkFlSGtiRnp6NFBtelgyNy90aThEWUluaz0ifQ==',
        ),
        development: resolveSecret(
          'eyJpdiI6IlB0d3NkSUNraGxpWnJJekdEcGowZEE9PSIsImVuY3J5cHRlZFZhbHVlIjoibEx4THk4Njh2aUEvQlRNTE5XeEQzcXltdlRjTkEvR0E2T2JzbkY4aVIvMD0iLCJlbmNyeXB0ZWRTeW1tZXRyaWNLZXkiOiJsYUVQem5sQUJXTTBFSnVHc0lLV2hGZHJnTDNxSHA1VFJlSHdVVTdRL0dtWGZlWGtpNnIzbTIwdDB5UmgxZDVZZkc3Q3lyZkF1MFlUbEpaUW9nbmxvb2RmS09aUFhPVHo2Z3JFaHdlWkRwWDB5WmhWc21EYW9TVFd2YVhjKy9CTnJqYll6Smw2RzJVdXBreldsQ2RLelNyeFVCbjBhV1lWbmhBcFl5RVE2MDI3Q1FMSUg0RnFKY0Y1OC9ONnpnMHNsREdpaXhFMzd6WnBMWEZRY1B1dm9jcURaSWRvVmZ5cmtVVFRJNlBFb3lhNys4Yyt6RmMrb0tuTURtQmV0aEd0bzFQQnlZdDUwV2ZjamwwWm8vcDZCQldiRlgyMmF0M2lvMUVFK203S2pRUnUxUklzYWh1MmNDV3NpQmVEemNFOGhsdzMxRU5JREpGTXhLZEJwRDFqY3RyeUdMZmprZUxkYTV1L3VVcGcwNFZiNSsrVWpURG9nNHBpbUQrbTZFKzZEYlp5ZHVaMUNheEV1NjJ6bUpTTVhNVDRpOHgxT0F0RjBrK0NiS0hZeHdNemc5c2RoV3ZxcHJYOXA1anFNNzVheXVTVEVGaFpDak1DSGh4dkVkY2pET205NU9pWXVLc01uZE1wR2NhenRCMnBrRGFuMDAvVnYwSmhra2ZjTExwU3MxVXcvNlV3R3RlMTFtdFdCS1RJY29zVnByaGhzQisvV25DdXp6V1RSVFV0QjI5Y0dLTzJZWEFjemZXVlA1VUdnT3Y4RW5OVjMvU0pvWUZXSVVDeDhVSWxyYllvNDFxSlpkM3Z1Z09DcFY5RVNVbnhaTTFDOE1rdzdmSXQ0YTExTmI5TWlLOWprNkdOeGRlQWMwQW8vaU9vWVVONWRPaDB5UUp6MGNpTnpTOD0ifQ==',
        ),
      },
    }

    const mainApp: EnvVars<Stage> = [
      {
        ...sharedEnvVar,
        envFiles: [files.mainApp],
      },
      {
        envFiles: [files.mainApp],
        key: 'INTERPOLATION',
        values: {
          production: `production: ${secretForInterpolation.production}`,
          staging: `staging: ${secretForInterpolation.staging}`,
          development: `development: ${secretForInterpolation.development}`,
        },
      },
      {
        envFiles: [files.mainApp],
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
    ]

    const helperLib: EnvVars<Stage> = [
      {
        ...sharedEnvVar,
        envFiles: [files.helperLib],
      },
      {
        envFiles: [files.helperLib],
        key: 'DEFAULT',
        values: {
          default: 'everywhere the same',
        },
      },
      {
        envFiles: [files.helperLib],
        key: 'DEFAULT_WITH_PARTIAL_OVERWRITE',
        values: {
          default: 'mostly everywhere the same',
          development: 'but not in dev',
        },
      },
    ]

    return [...mainApp, ...helperLib]
  }

  for (const stage of ['production', 'staging', 'development'] as Stage[]) {
    mkdirp.sync(`${__dirname}/output/${stage}`)
    await createEnvFiles({
      generateEnvVars,
      keys,
      stage,
      passphrase: passphrases[stage],
    })
  }

  expect(
    await loadEnvFile(`${__dirname}/output/production/main.env.local`),
  ).toEqual({
    SHARED_ENV_VAR: 'productionSharedSecret',
    INTERPOLATION: 'production: productionSecretForInterpolation',
    SUPER_SECRET: 'productionSuperSecret',
  })

  expect(
    await loadEnvFile(`${__dirname}/output/production/helper.env.local`),
  ).toEqual({
    SHARED_ENV_VAR: 'productionSharedSecret',
    DEFAULT: 'everywhere the same',
    DEFAULT_WITH_PARTIAL_OVERWRITE: 'mostly everywhere the same',
  })

  expect(
    await loadEnvFile(`${__dirname}/output/staging/main.env.local`),
  ).toEqual({
    SHARED_ENV_VAR: 'stagingSharedSecret',
    INTERPOLATION: 'staging: stagingSecretForInterpolation',
    SUPER_SECRET: 'stagingSuperSecret',
  })

  expect(
    await loadEnvFile(`${__dirname}/output/staging/helper.env.local`),
  ).toEqual({
    SHARED_ENV_VAR: 'stagingSharedSecret',
    DEFAULT: 'everywhere the same',
    DEFAULT_WITH_PARTIAL_OVERWRITE: 'mostly everywhere the same',
  })

  expect(
    await loadEnvFile(`${__dirname}/output/development/main.env.local`),
  ).toEqual({
    SHARED_ENV_VAR: 'developmentSharedSecret',
    INTERPOLATION: 'development: developmentSecretForInterpolation',
    SUPER_SECRET: 'developmentSuperSecret',
  })

  expect(
    await loadEnvFile(`${__dirname}/output/development/helper.env.local`),
  ).toEqual({
    SHARED_ENV_VAR: 'developmentSharedSecret',
    DEFAULT: 'everywhere the same',
    DEFAULT_WITH_PARTIAL_OVERWRITE: 'but not in dev',
  })
})
