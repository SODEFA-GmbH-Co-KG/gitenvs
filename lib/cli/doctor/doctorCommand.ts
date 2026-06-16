import { collectStatus } from '../status/statusCommand'
import { z } from 'zod'

export const doctorCommandSchema = z.object({
  json: z.boolean().default(false),
})

export const doctorCommand = async (
  options: z.infer<typeof doctorCommandSchema>,
) => {
  const status = await collectStatus()

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          ok: status.ok,
          issues: status.issues,
          status,
        },
        null,
        2,
      ),
    )
  } else if (status.ok) {
    console.log('✅ Gitenvs: doctor found no issues')
  } else {
    console.log('❌ Gitenvs: doctor found issues')
    for (const issue of status.issues) {
      console.log(`- ${issue}`)
    }
  }

  if (!status.ok) {
    process.exitCode = 1
  }
}
