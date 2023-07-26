import { bannerMessage } from "../messages/bannerMessage.mjs"
import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import { SlashCommandUserOption } from "discord.js"

export const BannerCommand = slashCommand({
  name: "banner",
  description: "Show a user's banner",
  defaultMemberPermissions: null,
  dmPermission: true,
  options: [
    slashOption(
      false,
      new SlashCommandUserOption()
        .setName("user")
        .setDescription("Target user"),
    ),
  ],
  async handle(interaction, user) {
    await interaction.reply(await bannerMessage(interaction, user ?? undefined))
  },
})
