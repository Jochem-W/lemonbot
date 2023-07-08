import { Colours } from "../colours.mjs"
import { codeBlock, EmbedBuilder } from "discord.js"

export function makeErrorMessage(error: Error, stack = false) {
  if (!stack) {
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle("An unexpected error has occurred")
          .setDescription(
            "It seems that an error has occurred. Staff is aware of the issue, and will try to fix it as soon as possible!"
          )
          .setTimestamp(Date.now())
          .setColor(Colours.red[500]),
      ],
      components: [],
    }
  }

  if (error.stack) {
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle("An unexpected error has occurred")
          .setDescription(codeBlock(error.stack))
          .setColor(Colours.red[500]),
      ],
      components: [],
    }
  }

  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(error.constructor.name)
        .setDescription(error.message)
        .setColor(Colours.red[500]),
    ],
    components: [],
  }
}
