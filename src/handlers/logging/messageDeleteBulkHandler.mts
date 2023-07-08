import { Colours } from "../../colours.mjs"
import { NoDataError } from "../../errors.mjs"
import { Config } from "../../models/config.mjs"
import { handler } from "../../models/handler.mjs"
import {
  fetchChannel,
  memberDisplayName,
  tryFetchMember,
  userDisplayName,
} from "../../utilities/discordUtilities.mjs"
import {
  ChannelType,
  EmbedBuilder,
  TextChannel,
  type MessageActionRowComponentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  italic,
  channelMention,
  userMention,
} from "discord.js"

let logChannel: TextChannel | undefined

export const MessageDeleteBulkHandler = handler({
  event: "messageDeleteBulk",
  once: false,
  async handle(messages, channel) {
    if (channel.guildId !== Config.guild) {
      return
    }

    logChannel ??= await fetchChannel(
      channel.client,
      Config.logs.message,
      ChannelType.GuildText
    )

    const info = new EmbedBuilder()
      .setTitle(`🗑️ ${messages.size} messages deleted`)
      .setDescription(channelMention(channel.id))
      .setColor(Colours.red[500])
      .setTimestamp(Date.now())

    const firstMessage = messages.last()
    if (!firstMessage) {
      throw new NoDataError("No messages")
    }

    const first = new EmbedBuilder()
      .setTitle("First message")
      .setColor(Colours.red[500])
      .setDescription(
        firstMessage.content === null
          ? italic("Not cached")
          : firstMessage.content || null
      )
      .setFooter({ text: firstMessage.id })
      .setTimestamp(firstMessage.createdAt)
    if (firstMessage.author) {
      const member = await tryFetchMember(channel.guild, firstMessage.author)
      first
        .setAuthor({
          name: member
            ? memberDisplayName(member)
            : userDisplayName(firstMessage.author),
          iconURL: (member ?? firstMessage.author).displayAvatarURL(),
        })
        .addFields(
          {
            name: "User",
            value: userMention(firstMessage.author.id),
            inline: true,
          },
          { name: "User ID", value: firstMessage.author.id, inline: true }
        )
    }

    const lastMessage = messages.first()
    if (!lastMessage) {
      throw new NoDataError("No messages")
    }

    const last = new EmbedBuilder()
      .setTitle("Last message")
      .setColor(Colours.red[500])
      .setDescription(
        lastMessage.content === null
          ? italic("Not cached")
          : lastMessage.content || null
      )
      .setFooter({ text: lastMessage.id })
      .setTimestamp(lastMessage.createdAt)
    if (lastMessage.author) {
      const member = await tryFetchMember(channel.guild, lastMessage.author)
      last
        .setAuthor({
          name: member
            ? memberDisplayName(member)
            : userDisplayName(lastMessage.author),
          iconURL: (member ?? lastMessage.author).displayAvatarURL(),
        })
        .addFields(
          {
            name: "User",
            value: userMention(lastMessage.author.id),
            inline: true,
          },
          { name: "User ID", value: lastMessage.author.id, inline: true }
        )
    }

    await logChannel.send({
      embeds: [info, first, last],
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setEmoji("🔗")
            .setLabel("Go to first message")
            .setURL(firstMessage.url)
        ),
      ],
    })
  },
})
