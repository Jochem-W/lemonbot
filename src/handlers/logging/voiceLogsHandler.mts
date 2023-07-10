import { Colours } from "../../colours.mjs"
import { NoDataError, NotImplementedError } from "../../errors.mjs"
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
  channelMention,
  userMention,
} from "discord.js"

let logChannel: TextChannel | undefined

export const VoiceLogsHandler = handler({
  event: "voiceStateUpdate",
  once: false,
  async handle(oldState, newState) {
    logChannel ??= await fetchChannel(
      newState.client,
      Config.logs.voice,
      ChannelType.GuildText
    )

    const member = newState.member
    if (!member) {
      throw new NoDataError("No member")
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: memberDisplayName(member),
        iconURL: member.displayAvatarURL(),
      })
      .setTimestamp(Date.now())

    let voiceChannelId
    if (!oldState.channelId && newState.channelId) {
      embed
        .setTitle("➡️ Joined a voice channel")
        .setDescription(channelMention(newState.channelId))
        .setColor(Colours.green[500])
      voiceChannelId = newState.channelId
    } else if (oldState.channelId && !newState.channelId) {
      embed
        .setTitle("⬅️ Left a voice channel")
        .setDescription(channelMention(oldState.channelId))
        .setColor(Colours.red[500])
      voiceChannelId = oldState.channelId
    } else if (
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId
    ) {
      embed
        .setTitle("↔️ Switched between voice channels")
        .setFields(
          {
            name: "Before",
            value: channelMention(oldState.channelId),
            inline: true,
          },
          {
            name: "After",
            value: channelMention(newState.channelId),
            inline: true,
          }
        )
        .setColor(Colours.amber[500])
      voiceChannelId = newState.channelId
    } else {
      throw new NotImplementedError("Voice log not implemented")
    }

    const voiceChannel = await fetchChannel(newState.client, voiceChannelId, [
      ChannelType.GuildVoice,
      ChannelType.GuildStageVoice,
    ])

    embed.addFields(
      {
        name: "Connected members",
        value:
          truncate(
            voiceChannel.members.map((m) => userMention(m.id)),
            1024
          ) || "None",
      },
      { name: "User ID", value: member.id, inline: true },
      { name: "Voice channel ID", value: voiceChannel.id, inline: true }
    )

    await logChannel.send({ embeds: [embed] })
  },
})
