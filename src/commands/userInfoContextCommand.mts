import { userInfoMessage } from "../messages/userInfoMessage.mjs"
import { contextMenuCommand } from "../models/contextMenuCommand.mjs"
import { ApplicationCommandType, PermissionFlagsBits } from "discord.js"

export const UserInfoContextCommand = contextMenuCommand({
  name: "View user info",
  type: ApplicationCommandType.User,
  defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
  dmPermission: false,
  async handle(interaction, user) {
    await interaction.reply({
      ...(await userInfoMessage(interaction, user)),
      ephemeral: true,
    })
  },
})
