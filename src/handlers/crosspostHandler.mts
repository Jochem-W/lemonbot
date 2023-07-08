import { handler } from "../models/handler.mjs"
import { ChannelType } from "discord.js"

export const CrosspostHandler = handler({
  event: "messageCreate",
  once: false,
  async handle(message) {
    if (message.channel.type === ChannelType.GuildAnnouncement) {
      await message.crosspost()
    }
  },
})
