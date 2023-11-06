import { bannerMessage } from "../messages/bannerMessage.mjs"
import { slashCommand } from "../models/slashCommand.mjs"

export const BannerCommand = slashCommand({
  name: "banner",
  description: "Show a user's banner",
  defaultMemberPermissions: null,
  dmPermission: true,
  nsfw: false,
  options: [
    { name: "user", description: "Target user", type: "user", required: false },
  ],
  async handle(interaction, user) {
    await interaction.reply(await bannerMessage(interaction, user ?? undefined))
  },
})
