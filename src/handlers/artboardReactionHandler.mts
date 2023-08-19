import { Drizzle } from "../clients.mjs"
import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import { artboard } from "../schema.mjs"
import { uniqueName, userDisplayName } from "../utilities/discordUtilities.mjs"
import { EmbedBuilder, Webhook, userMention } from "discord.js"
import { eq } from "drizzle-orm"
import postgres from "postgres"

let webhook: Webhook | undefined

export const ArtboardReactionHandler = handler({
  event: "messageReactionAdd",
  once: false,
  async handle(reaction) {
    if (!Config.artboard.watch.includes(reaction.message.channelId)) {
      return
    }

    if (!reaction.count) {
      reaction = await reaction.fetch()
    }

    if (reaction.count < Config.artboard.reactionCount) {
      return
    }

    try {
      await Drizzle.insert(artboard).values({
        messageId: reaction.message.id,
        channelId: reaction.message.channelId,
      })
    } catch (e) {
      if (!(e instanceof postgres.PostgresError) || e.code !== "23505") {
        throw e
      }

      return
    }

    if (!webhook) {
      webhook = await reaction.client.fetchWebhook(Config.artboard.webhook)
    }

    const originalMessage = await reaction.message.fetch()

    const threadMessage = await webhook.send({
      username: userDisplayName(originalMessage.author),
      avatarURL: originalMessage.author.displayAvatarURL({ size: 4096 }),
      threadName: `Art by @${uniqueName(originalMessage.author)}`,
      content: originalMessage.content,
      embeds: [
        ...originalMessage.embeds.slice(0, 9),
        new EmbedBuilder().setDescription(
          `Posted by ${userMention(originalMessage.author.id)} in ${
            originalMessage.url
          }`,
        ),
      ],
      files: [...originalMessage.attachments.values()],
    })

    await Drizzle.update(artboard)
      .set({ threadId: threadMessage.id })
      .where(eq(artboard.messageId, originalMessage.id))
  },
})
