import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import { PermissionFlagsBits } from "discord.js"

export const NoStickersHandler = handler({
  event: "messageCreate",
  once: false,
  async handle(message) {
    if (!message.inGuild()) {
      return
    }

    if (message.channelId !== Config.channels.general2) {
      return
    }

    if (message.stickers.size === 0) {
      return
    }

    if (
      message.member?.permissions.has(PermissionFlagsBits.ManageMessages, true)
    ) {
      return
    }

    if (!message.deletable) {
      return
    }

    await message.delete()
  },
})
