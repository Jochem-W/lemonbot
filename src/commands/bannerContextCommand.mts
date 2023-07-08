import { bannerMessage } from "../messages/bannerMessage.mjs"
import { contextMenuCommand } from "../models/contextMenuCommand.mjs"
import { ApplicationCommandType } from "discord.js"

export const BannerContextCommand = contextMenuCommand({
  name: "View banner",
  type: ApplicationCommandType.User,
  defaultMemberPermissions: null,
  dmPermission: true,
  async handle(interaction, user) {
    await interaction.reply({
      ...(await bannerMessage(interaction, user)),
      ephemeral: true,
    })
  },
})
