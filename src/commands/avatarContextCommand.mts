import { avatarMessage } from "../messages/avatarMessage.mjs"
import { contextMenuCommand } from "../models/contextMenuCommand.mjs"
import { ApplicationCommandType } from "discord.js"

export const AvatarContextCommand = contextMenuCommand({
  name: "View avatar",
  type: ApplicationCommandType.User,
  defaultMemberPermissions: null,
  dmPermission: true,
  async handle(interaction, user) {
    await interaction.reply({
      ...(await avatarMessage(interaction, user, true)),
      ephemeral: true,
    })
  },
})
