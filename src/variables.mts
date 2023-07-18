import camelcaseKeys from "camelcase-keys"
import { z } from "zod"

const model = z
  .object({
    DISCORD_BOT_TOKEN: z.string(),
    COMMIT_HASH: z.string().optional(),
    GITHUB_TOKEN: z.string().optional(),
    NODE_ENV: z.string().optional().default("development"),
    DATABASE_URL: z.string(),
    S3_REGION: z.string(),
    S3_ENDPOINT: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
  })
  .transform((arg) => camelcaseKeys(arg))

export const Variables = await model.parseAsync(process.env)
