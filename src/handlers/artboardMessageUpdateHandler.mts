import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"

export const ArtboardMessageUpdateHandler = handler({
  event: "messageUpdate",
  once: false,
  async handle(_oldMessage, newMessage) {
    if (!Config.artboard.watch.includes(newMessage.channelId)) {
      return
    }

    if (newMessage.attachments.size === 0 && newMessage.embeds.length === 0) {
      return
    }

    if (newMessage.reactions.cache.has("❤️")) {
      return
    }

    await newMessage.react("❤️")
  },
})
