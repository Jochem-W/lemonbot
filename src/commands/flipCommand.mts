import { NoDataError } from "../errors.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import { interactionMember } from "../utilities/interactionUtilities.mjs"
import { randomInt } from "crypto"
import { EmbedBuilder } from "discord.js"
import { setTimeout } from "timers/promises"

const options = [
  {
    name: "heads",
    thumbnail:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1125824626572922950/coinflip_heads.png",
  },
  {
    name: "tails",
    thumbnail:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1125824625914413096/coinflip_tails.png",
  },
]

export const FlipCommand = slashCommand({
  name: "flip",
  description: "Flip a coin",
  defaultMemberPermissions: null,
  dmPermission: true,
  nsfw: false,
  async handle(interaction) {
    const user = interaction.user
    const member = await interactionMember(interaction)

    const option = options[randomInt(options.length)]
    if (!option) {
      throw new NoDataError("No choices")
    }

    const author = {
      name: "Flipping a coin...",
      iconURL: (member ?? user).displayAvatarURL({ size: 4096 }),
    }

    const embed = new EmbedBuilder()
      .setAuthor(author)
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/1125446368002052186/1125824626216423424/coinflip.gif",
      )
    await interaction.reply({ embeds: [embed] })

    await setTimeout(2000)

    author.name = "Flipped a coin"

    embed
      .setAuthor(author)
      .setTitle(`It landed on ${option.name}!`)
      .setThumbnail(option.thumbnail)

    await interaction.editReply({ embeds: [embed] })
  },
})
