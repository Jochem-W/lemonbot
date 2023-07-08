import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"

export const ArtboardMessageCreateHandler = handler({
  event: "messageCreate",
  once: false,
  async handle(message) {
    if (!Config.artboard.watch.includes(message.channelId)) {
      return
    }

    if (message.attachments.size === 0 && message.embeds.length === 0) {
      return
    }

    await message.react("❤️")
  },
})
