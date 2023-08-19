import { Colours } from "../../colours.mjs"
import { Config } from "../../models/config.mjs"
import { handler } from "../../models/handler.mjs"
import {
  fetchChannel,
  userDisplayName,
} from "../../utilities/discordUtilities.mjs"
import {
  ChannelType,
  EmbedBuilder,
  userMention,
  type TextChannel,
} from "discord.js"

let logChannel: TextChannel | undefined

export const GuildBanRemoveHandler = handler({
  event: "guildBanRemove",
  once: false,
  async handle(ban) {
    logChannel ??= await fetchChannel(
      ban.client,
      Config.logs.member,
      ChannelType.GuildText,
    )

    if (ban.guild.id !== Config.guild) {
      return
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: userDisplayName(ban.user),
        iconURL: ban.user.displayAvatarURL({ size: 4096 }),
      })
      .setTitle(`🙏 User unbanned`)
      .setThumbnail(ban.user.displayAvatarURL({ size: 4096 }))
      .setDescription(userMention(ban.user.id))
      .setColor(Colours.amber[500])
      .setFooter({ text: ban.user.id })
      .setTimestamp(Date.now())

    await logChannel.send({ embeds: [embed] })
  },
})
