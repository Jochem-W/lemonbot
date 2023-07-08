import { Colours } from "../../colours.mjs"
import { Config } from "../../models/config.mjs"
import { handler } from "../../models/handler.mjs"
import {
  fetchChannel,
  memberDisplayName,
  userDisplayName,
} from "../../utilities/discordUtilities.mjs"
import {
  ChannelType,
  EmbedBuilder,
  userMention,
  type TextChannel,
} from "discord.js"

let logChannel: TextChannel | undefined

export const GuildBanAddHandler = handler({
  event: "guildBanAdd",
  once: false,
  async handle(ban) {
    logChannel ??= await fetchChannel(
      ban.client,
      Config.logs.member,
      ChannelType.GuildText
    )

    if (ban.guild.id !== Config.guild) {
      return
    }

    const member = ban.guild.members.cache.get(ban.user.id)
    const noun = member ? "Member" : "User"

    const embed = new EmbedBuilder()
      .setAuthor({
        name: member ? memberDisplayName(member) : userDisplayName(ban.user),
        iconURL: (member ?? ban.user).displayAvatarURL(),
      })
      .setTitle(`🔨 ${noun} banned`)
      .setThumbnail((member ?? ban.user).displayAvatarURL())
      .setDescription(userMention(ban.user.id))
      .setColor(Colours.red[500])
      .setFooter({ text: ban.user.id })
      .setTimestamp(Date.now())

    if (ban.reason) {
      embed.addFields({ name: "Reason", value: ban.reason })
    }

    await logChannel.send({ embeds: [embed] })
  },
})
