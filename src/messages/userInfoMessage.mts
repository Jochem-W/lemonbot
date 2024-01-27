import { uniqueName } from "../utilities/discordUtilities.mjs"
import { interactionMember } from "../utilities/interactionUtilities.mjs"
import {
  userMention,
  EmbedBuilder,
  time,
  TimestampStyles,
  GuildMember,
  formatEmoji,
  roleMention,
  type Interaction,
  User,
} from "discord.js"

function formatPresence(member: GuildMember) {
  const mobile = member.presence?.clientStatus?.mobile

  const status =
    mobile === "online" ? "mobile" : member.presence?.status ?? "offline"
  const emoji = member.guild.emojis.cache.find((e) => e.name === status)

  let presence = "Currently "
  switch (status) {
    case "offline":
    case "idle":
    case "online":
      presence += status
      break
    case "dnd":
      presence += "on do not disturb"
      break
    case "mobile":
      presence += "online on mobile"
      break
  }

  if (!emoji) {
    return presence
  }

  return `${presence} ${formatEmoji(emoji.id, emoji.animated ?? false)}`
}

export async function userInfoMessage(interaction: Interaction, user?: User) {
  user ??= interaction.user
  if (!user.accentColor || !user.banner) {
    await user.fetch(true)
  }

  const lines: string[] = [userMention(user.id)]

  const embed = new EmbedBuilder()
    .setColor(user.accentColor ?? null)
    .setTitle(uniqueName(user))
    .setThumbnail(user.displayAvatarURL({ size: 4096 }))
    .setImage(user.bannerURL({ size: 4096 }) ?? null)
    .setFields({
      name: "Created at",
      value: time(user.createdAt, TimestampStyles.ShortDateTime),
      inline: true,
    })
    .setFooter({ text: user.id })
    .setTimestamp(Date.now())

  const member = await interactionMember(interaction, { user })
  if (member) {
    embed.setThumbnail(member.displayAvatarURL({ size: 4096 }))

    const presence = formatPresence(member)
    if (presence) {
      lines.push(presence)
    }

    if (member.joinedAt) {
      embed.addFields({
        name: "Joined at",
        value: time(member.joinedAt, TimestampStyles.ShortDateTime),
        inline: true,
      })
    }

    const roles = member.roles.cache.filter(
      (r) => r.id !== member.guild.roles.everyone.id,
    )
    if (roles.size > 0) {
      embed.addFields({
        name: "Roles",
        value: member.roles.cache
          .filter((r) => r.id !== member.guild.roles.everyone.id)
          .map((r) => roleMention(r.id))
          .join(" "),
      })
    }
  }

  embed.setDescription(lines.join("\n"))

  return { embeds: [embed], ephemeral: true }
}
