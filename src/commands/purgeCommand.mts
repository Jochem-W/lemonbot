import { InvalidChannelTypeError } from "../errors.mjs"
import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import { interactionChannel } from "../utilities/interactionUtilities.mjs"
import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandIntegerOption,
} from "discord.js"

export const PurgeCommand = slashCommand({
  name: "purge",
  description: "Purge recent messages",
  defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
  dmPermission: false,
  options: [
    slashOption(
      true,
      new SlashCommandIntegerOption()
        .setName("limit")
        .setDescription("How many messages to delete")
        .setMaxValue(100)
        .setMinValue(2)
    ),
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
