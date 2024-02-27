import { DownloadError } from "../errors.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import {
  ChannelType,
  EmbedBuilder,
  type GuildTextBasedChannel,
  AttachmentBuilder,
  type AttachmentData,
  PermissionFlagsBits,
} from "discord.js"
import type { Stream } from "stream"
import MIMEType from "whatwg-mimetype"

export const SayCommand = slashCommand({
  name: "say",
  description: "Send a message to a channel using the bot",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  dmPermission: false,
  nsfw: false,
  options: [
    {
      name: "message",
      description: "The message to send",
      type: "string",
      required: true,
    },
    {
      name: "channel",
      description:
        "The channel to send the message to, or the current channel if omitted",
      type: "channel",
      required: false,
      channelTypes: [
        ChannelType.GuildAnnouncement,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread,
        ChannelType.GuildText,
        ChannelType.GuildForum,
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
      ],
    },
    {
      name: "attachment",
      description: "Attachment to send with the message",
      type: "attachment",
      required: false,
    },
  ],
  async handle(interaction, content, channel, attachment) {
    if (!channel) {
      channel =
        interaction.channel ??
        (await interaction.client.channels.fetch(interaction.channelId))
    }

    const files = []
    if (attachment) {
      await interaction.deferReply({ ephemeral: true })

      const response = await fetch(attachment.url)
      if (!response.ok) {
        throw new DownloadError(attachment.url)
      }

      const data: AttachmentData = { name: attachment.name }
      if (attachment.description) {
        data.description = attachment.description
      }

      files.push(
        new AttachmentBuilder(response.body as unknown as Stream, data),
      )
    }

    const message = await (channel as GuildTextBasedChannel).send({
      content,
      files,
    })

    let mimeType
    const sentAttachment = message.attachments.first()
    if (sentAttachment?.contentType) {
      mimeType = new MIMEType(sentAttachment.contentType)
    }

    const reply = {
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle("Message sent")
          .setURL(message.url)
          .setImage(
            mimeType?.type === "image" ? sentAttachment?.url ?? null : null,
          )
          .setDescription(content)
          .setFooter({ text: message.id })
          .setTimestamp(message.createdTimestamp),
      ],
    }

    if (interaction.deferred) {
      await interaction.editReply(reply)
      return
    }

    await interaction.reply({ ...reply, ephemeral: true })
  },
})
