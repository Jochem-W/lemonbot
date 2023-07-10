import { Colours } from "../colours.mjs"
import { EmbedBuilder, type Interaction } from "discord.js"

export function invalidQuestionMessage(
  interaction: Interaction,
  id: string,
  body?: string
) {
  const embed = new EmbedBuilder()
    .setTitle("Invalid question")
    .setDescription("The question you're trying to update doesn't exist!")
    .setFooter({ text: id })
    .setTimestamp(interaction.createdAt)
    .setColor(Colours.red[500])

  if (body) {
    embed.setFields({ name: "New body", value: body })
  }

  return { ephemeral: true, embeds: [embed] }
}
