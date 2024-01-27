import { bannerMessage } from "../messages/bannerMessage.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import { PermissionFlagsBits } from "discord.js"

export const BannerCommand = slashCommand({
  name: "banner",
  description: "Show a user's banner",
  defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
  dmPermission: false,
  nsfw: false,
  options: [
    { name: "user", description: "Target user", type: "user", required: false },
  ],
  async handle(interaction, user) {
    await interaction.reply(await bannerMessage(interaction, user ?? undefined))
  },
})
