import { readFile } from "fs/promises"
import { z } from "zod"

const model = z.object({
  art: z.object({
    general: z.string(),
    others: z.string(),
    wips: z.string(),
    yours: z.string(),
  }),
  applicationId: z.string(),
  autoBan: z.object({
    banReason: z.string(),
    days: z.number(),
    unbanReason: z.string(),
  }),
  artboard: z.object({
    id: z.string(),
    reactionCount: z.number(),
    watch: z.array(z.string()),
    webhook: z.string(),
  }),
  channels: z.object({
    characters: z.string(),
    error: z.string(),
    modGeneral: z.string(),
    qotw: z.string(),
    restart: z.string(),
  }),
  guild: z.string(),
  logs: z.object({
    member: z.string(),
    message: z.string(),
    user: z.string(),
    verify: z.string(),
    voice: z.string(),
  }),
  mailUser: z.string(),
  lemon: z.array(z.string()),
  repository: z
    .object({
      name: z.string(),
      owner: z.string(),
    })
    .optional(),
  s3: z.object({ bucket: z.string(), url: z.string().url() }),
  roles: z.object({ art: z.string(), media: z.string(), qotw: z.string() }),
})

export const Config = await model.parseAsync(
  JSON.parse(await readFile("config.json", "utf-8")),
)
