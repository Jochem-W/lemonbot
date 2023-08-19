import { Colours } from "../../colours.mjs"
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
  hyperlink,
  italic,
  userMention,
  type TextChannel,
  ActionRowBuilder,
  type MessageActionRowComponentBuilder,
  ButtonBuilder,
  ButtonStyle,
  channelMention,
} from "discord.js"
import MIMEType from "whatwg-mimetype"

let logChannel: TextChannel | undefined

export const MessageUpdateHandler = handler({
  event: "messageUpdate",
  once: false,
  async handle(oldMessage, newMessage) {
    logChannel ??= await fetchChannel(
      newMessage.client,
      Config.logs.message,
      ChannelType.GuildText,
    )

    if (newMessage.partial) {
      newMessage = await newMessage.fetch()
    }

    if (!newMessage.guildId || newMessage.guildId !== Config.guild) {
      return
    }

    if (newMessage.author.bot) {
      return
    }

    if (oldMessage.content === newMessage.content) {
      return
    }

    const embeds = newMessage.attachments
      .filter(
        (a) => a.contentType && new MIMEType(a.contentType).type === "image",
      )
      .map((a) => new EmbedBuilder().setURL(newMessage.url).setImage(a.url))

    let firstEmbed = embeds[0]
    if (!firstEmbed) {
      firstEmbed = new EmbedBuilder()
      embeds.push(firstEmbed)
    } else if (embeds.length === 1) {
      firstEmbed.setURL(null)
    }

    const member = await tryFetchMember(logChannel.guild, newMessage.author)

    firstEmbed
      .setAuthor({
        name: member
          ? memberDisplayName(member)
          : userDisplayName(newMessage.author),
        iconURL: (member ?? newMessage.author).displayAvatarURL({ size: 4096 }),
      })
      .setTitle("📝 Message edited")
      .setColor(Colours.amber[500])
      .setFields(
        {
          name: "Before",
          value:
            oldMessage.content === null
              ? italic("Not cached")
              : oldMessage.content || "\u200b",
        },
        { name: "After", value: newMessage.content || "\u200b" },
      )
      .setFooter({ text: newMessage.id })
      .setTimestamp(newMessage.editedAt)

    if (newMessage.attachments.size > 0) {
      firstEmbed.addFields({
        name: "Attachments",
        value: newMessage.attachments
          .map((a) => `- ${hyperlink(a.name, a.url)}`)
          .join("\n"),
      })
    }

    firstEmbed.addFields(
      {
        name: "User",
        value: userMention(newMessage.author.id),
        inline: true,
      },
      { name: "User ID", value: newMessage.author.id, inline: true },
      {
        name: "Channel",
        value: channelMention(newMessage.channelId),
        inline: true,
      },
    )

    await logChannel.send({
      embeds,
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setEmoji("🔗")
            .setLabel("Go to message")
            .setURL(newMessage.url),
        ),
      ],
    })
  },
})
