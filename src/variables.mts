import camelcaseKeys from "camelcase-keys"
import { z } from "zod"

const model = z
  .object({
    DATABASE_URL: z.string(),
    DISCORD_BOT_TOKEN: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_ENDPOINT: z.string(),
    S3_REGION: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
  })
  .transform((arg) => camelcaseKeys(arg))

export const Variables = await model.parseAsync(process.env)
