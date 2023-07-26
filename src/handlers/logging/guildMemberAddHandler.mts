import { Colours } from "../../colours.mjs"
import { Config } from "../../models/config.mjs"
import { handler } from "../../models/handler.mjs"
import {
  fetchChannel,
  memberDisplayName,
  truncate,
} from "../../utilities/discordUtilities.mjs"
import {
  ChannelType,
  EmbedBuilder,
  TextChannel,
  TimestampStyles,
  roleMention,
  time,
  userMention,
} from "discord.js"

let logChannel: TextChannel | undefined

export const GuildMemberAddHandler = handler({
  event: "guildMemberAdd",
  once: false,
  async handle(member) {
    logChannel ??= await fetchChannel(
      member.client,
      Config.logs.member,
      ChannelType.GuildText,
    )

    if (member.guild.id !== Config.guild) {
      return
    }

    if (!member.user.banner) {
      await member.user.fetch()
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: memberDisplayName(member),
        iconURL: member.displayAvatarURL(),
      })
      .setTitle("➡️ Member joined")
      .setThumbnail(member.displayAvatarURL())
      .setDescription(userMention(member.id))
      .setFields({
        name: "Account created at",
        value: time(member.user.createdAt, TimestampStyles.ShortDateTime),
      })
      .setImage(member.user.bannerURL({ size: 4096 }) ?? null)
      .setColor(Colours.green[500])
      .setFooter({ text: member.id })
      .setTimestamp(member.joinedAt ?? Date.now())

    const roles = member.roles.cache.filter(
      (r) => r.id !== member.guild.roles.everyone.id,
    )
    if (roles.size > 0) {
      embed.addFields({
        name: "Roles",
        value: truncate(
          roles.map((r) => roleMention(r.id)),
          1024,
        ),
      })
    }

    await logChannel.send({
      embeds: [embed],
    })
  },
})
