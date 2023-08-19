import { Colours } from "../colours.mjs"
import { NoDataError } from "../errors.mjs"
import { Config } from "../models/config.mjs"
import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import { tryFetchMember } from "../utilities/discordUtilities.mjs"
import { randomInt } from "crypto"
import { EmbedBuilder, SlashCommandStringOption } from "discord.js"

const choices = ["rock", "paper", "scissors"] as const

function upperFirst(text: string) {
  const first = text[0]
  if (!first) {
    return text
  }

  return first.toUpperCase() + text.slice(1)
}

export const RpsCommand = slashCommand({
  name: "rps",
  description: "Play rock paper scissors against the bot",
  defaultMemberPermissions: null,
  dmPermission: true,
  options: [
    slashOption(
      true,
      new SlashCommandStringOption()
        .setName("choice")
        .setDescription("Your choice")
        .setChoices(...choices.map((c) => ({ name: c, value: c }))),
    ),
  ],
  async handle(interaction, choice) {
    const botChoice = choices[randomInt(choices.length)]
    if (!botChoice) {
      throw new NoDataError("No choices")
    }

    const clientMember = await tryFetchMember(
      { id: Config.guild, client: interaction.client },
      interaction.client.user.id,
    )

    const embed = new EmbedBuilder().setFields(
      { name: "You chose", value: upperFirst(choice), inline: true },
      { name: "I chose", value: upperFirst(botChoice), inline: true },
    )
    if (botChoice === choice) {
      embed.setAuthor({
        name: `We both chose ${botChoice.toLowerCase()}; it's a draw!`,
        iconURL: (clientMember ?? interaction.user).displayAvatarURL({
          size: 4096,
        }),
      })
    } else if (
      (choice === "rock" && botChoice === "paper") ||
      (choice === "paper" && botChoice === "scissors") ||
      (choice === "scissors" && botChoice === "rock")
    ) {
      embed
        .setAuthor({
          name: `I chose ${botChoice.toLowerCase()}; I win!`,
          iconURL: (clientMember ?? interaction.user).displayAvatarURL({
            size: 4096,
          }),
        })
        .setColor(Colours.red[500])
    } else {
      embed
        .setAuthor({
          name: `I chose ${botChoice.toLowerCase()}; you win!`,
          iconURL: (clientMember ?? interaction.user).displayAvatarURL({
            size: 4096,
          }),
        })
        .setColor(Colours.green[500])
    }

    await interaction.reply({ embeds: [embed] })
  },
})
