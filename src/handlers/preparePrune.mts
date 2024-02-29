import { Drizzle } from "../clients.mjs"
import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import { pruneMembers, pruneProgress } from "../schema.mjs"
import { FetchMessagesOptions } from "discord.js"
import { eq } from "drizzle-orm"
import { DateTime } from "luxon"

export const PreparePrune = handler({
  event: "ready",
  once: true,
  async handle(client) {
    const guild = await client.guilds.fetch(Config.guild)
    for (const [, channel] of await guild.channels.fetch()) {
      if (!channel?.isTextBased()) {
        return
      }

      const [status] = await Drizzle.select({ before: pruneProgress.before })
        .from(pruneProgress)
        .where(eq(pruneProgress.channel, channel.id))

      const options: FetchMessagesOptions = {
        limit: 100,
      }
      if (status?.before) {
        options.before = status.before
      }

      let messages
      while (!messages || messages.size === options.limit) {
        messages = await channel.messages.fetch(options)

        const oldestMessage = messages.at(-1)
        if (!oldestMessage) {
          break
        }

        for (const [, message] of messages) {
          await Drizzle.insert(pruneMembers)
            .values({
              user: message.author.id,
              newest: message.createdAt,
              channel: message.channelId,
            })
            .onConflictDoNothing()
        }

        options.before = oldestMessage.id
        await Drizzle.insert(pruneProgress)
          .values({
            channel: channel.id,
            before: oldestMessage.id,
          })
          .onConflictDoUpdate({
            target: pruneProgress.channel,
            set: { before: oldestMessage.id },
          })

        if (
          DateTime.fromJSDate(oldestMessage.createdAt)
            .diffNow()
            .negate()
            .as("months") > 1
        ) {
          break
        }
      }
    }
  },
})
