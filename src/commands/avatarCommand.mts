import { avatarMessage } from "../messages/avatarMessage.mjs"
import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import { SlashCommandUserOption, SlashCommandBooleanOption } from "discord.js"

export const AvatarCommand = slashCommand({
  name: "avatar",
  description: "Show a user's avatar",
  defaultMemberPermissions: null,
  dmPermission: true,
  options: [
    slashOption(
      false,
      new SlashCommandUserOption()
        .setName("user")
        .setDescription("Target user"),
    ),
    slashOption(
      false,
      new SlashCommandBooleanOption()
        .setName("server")
        .setDescription(
          "Show the user's server avatar if available, defaults to True",
        ),
    ),
  ],
  async handle(interaction, user, server) {
    await interaction.reply(
      await avatarMessage(interaction, user ?? undefined, server ?? undefined),
    )
  },
})
