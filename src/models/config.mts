import { readFile } from "fs/promises"
import { z } from "zod"

const model = z.object({
  autoBan: z.object({
    banReason: z.string(),
    days: z.number(),
    unbanReason: z.string(),
  }),
  applicationId: z.string(),
  artboard: z.object({
    id: z.string(),
    reactionCount: z.number(),
    watch: z.array(z.string()),
    webhook: z.string(),
  }),
  channels: z.object({
    error: z.string(),
    modGeneral: z.string(),
    qotw: z.string(),
    restart: z.string(),
  }),
  guild: z.string(),
  logs: z.object({
    member: z.string(),
    message: z.string(),
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
  roles: z.object({ art: z.string(), media: z.string(), qotw: z.string() }),
})

export const Config = await model.parseAsync(
  JSON.parse(await readFile("config.json", "utf-8"))
)
