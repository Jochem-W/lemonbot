import {
  memberDisplayName,
  userDisplayName,
} from "../utilities/discordUtilities.mjs"
import { interactionMember } from "../utilities/interactionUtilities.mjs"
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  User,
  type Interaction,
  type MessageActionRowComponentBuilder,
} from "discord.js"

export async function bannerMessage(interaction: Interaction, user?: User) {
  user ??= interaction.user
  if (!user.accentColor || !user.banner) {
    await user.fetch(true)
  }

  const author = {
    name: `${userDisplayName(user)}'s banner`,
    iconURL: user.displayAvatarURL({ size: 4096 }),
  }

  const embed = new EmbedBuilder()
    .setColor(user.accentColor ?? null)
    .setFooter({ text: user.id })
    .setTimestamp(Date.now())

  const member = await interactionMember(interaction, { user })
  if (member) {
    author.name = `${memberDisplayName(member)}'s banner`
    author.iconURL = member.displayAvatarURL({ size: 4096 })
  }

  embed.setAuthor(author)

  const userBanner = user.bannerURL({ size: 4096 })
  if (!userBanner) {
    embed.setDescription("This user has no banner")
    return { embeds: [embed] }
  }

  embed.setImage(userBanner)

  const actionRow =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setEmoji("🖼️")
        .setLabel("Banner")
        .setURL(userBanner),
    )

  return { embeds: [embed], components: [actionRow] }
}
