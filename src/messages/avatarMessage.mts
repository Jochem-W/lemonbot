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

export async function avatarMessage(
  interaction: Interaction,
  user?: User,
  server?: boolean
) {
  user ??= interaction.user
  server ??= true

  if (!user.accentColor) {
    await user.fetch(true)
  }

  const userAvatar = user.displayAvatarURL({ size: 4096 })

  const author = {
    name: `${userDisplayName(user)}'s avatar`,
    iconURL: userAvatar,
  }

  const embed = new EmbedBuilder()
    .setColor(user.accentColor ?? null)
    .setImage(userAvatar)
    .setFooter({ text: user.id })
    .setTimestamp(Date.now())

  const actionRow =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setEmoji("🖼️")
        .setLabel("User avatar")
        .setURL(userAvatar)
    )

  const member = await interactionMember(interaction, { user })
  if (member) {
    const memberAvatar = member.displayAvatarURL({ size: 4096 })

    author.name = `${memberDisplayName(member)}'s avatar`
    author.iconURL = memberAvatar

    if (server) {
      embed.setImage(memberAvatar)
    }

    if (memberAvatar !== userAvatar) {
      actionRow.setComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setEmoji("🖼️")
          .setLabel("Server avatar")
          .setURL(memberAvatar),
        ...actionRow.components
      )
    }
  }

  embed.setAuthor(author)

  return { embeds: [embed], components: [actionRow] }
}
