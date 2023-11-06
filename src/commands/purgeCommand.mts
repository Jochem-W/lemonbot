import { InvalidChannelTypeError } from "../errors.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import { interactionChannel } from "../utilities/interactionUtilities.mjs"
import { EmbedBuilder, PermissionFlagsBits } from "discord.js"

export const PurgeCommand = slashCommand({
  name: "purge",
  description: "Purge recent messages",
  defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
  dmPermission: false,
  nsfw: false,
  options: [
    {
      name: "limit",
      description: "The amount of messages to delete",
      type: "integer",
      required: true,
      minValue: 2,
      maxValue: 100,
    },
  ],
  async handle(interaction, limit) {
    const channel = await interactionChannel(interaction, true)
    if (!("bulkDelete" in channel)) {
      throw new InvalidChannelTypeError(channel)
    }

    const messages = await channel.bulkDelete(limit)
    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle("Channel purged")
          .setDescription(`Successfully deleted ${messages.size} messages`),
      ],
    })
  },
})
