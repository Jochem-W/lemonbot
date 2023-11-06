import { avatarMessage } from "../messages/avatarMessage.mjs"
import { slashCommand } from "../models/slashCommand.mjs"

export const AvatarCommand = slashCommand({
  name: "avatar",
  description: "Show a user's avatar",
  defaultMemberPermissions: null,
  dmPermission: true,
  nsfw: false,
  options: [
    {
      name: "user",
      description: "Target user",
      type: "user",
      required: false,
    },
    {
      name: "server",
      description:
        "Show the user's server avatar if available; defaults to True",
      type: "boolean",
      required: false,
    },
  ],
  async handle(interaction, user, server) {
    await interaction.reply(
      await avatarMessage(interaction, user ?? undefined, server ?? undefined),
    )
  },
})
