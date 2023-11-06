import { InvalidChannelTypeError } from "../errors.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import { interactionChannel } from "../utilities/interactionUtilities.mjs"
import {
  EmbedBuilder,
  PermissionFlagsBits,
  channelMention,
  inlineCode,
} from "discord.js"

export const SlowmodeCommand = slashCommand({
  name: "slowmode",
  description: "Set the slowmode for a channel",
  defaultMemberPermissions: PermissionFlagsBits.ManageChannels,
  dmPermission: false,
  nsfw: false,
  options: [
    {
      name: "delay",
      description: "The slowmode delay in seconds",
      type: "integer",
      required: true,
      minValue: 0,
      maxValue: 21600,
    },
  ],
  async handle(interaction, delay) {
    const channel = await interactionChannel(interaction, true)
    if (!("edit" in channel)) {
      throw new InvalidChannelTypeError(channel)
    }

    await channel.edit({ rateLimitPerUser: delay })

    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle("Slowmode changed")
          .setDescription(
            `Set the slowmode to ${inlineCode(
              delay.toString(10),
            )} for ${channelMention(channel.id)}`,
          )
          .setFooter({ text: channel.id })
          .setTimestamp(Date.now()),
      ],
    })
  },
})
