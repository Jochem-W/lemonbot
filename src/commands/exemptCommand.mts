import { Exemptions } from "../handlers/banNewAccountsHandler.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import { EmbedBuilder, PermissionFlagsBits, userMention } from "discord.js"

export const ExemptCommand = slashCommand({
  name: "exempt",
  description: "Exempt a user from the 30 day account age requirement",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  dmPermission: false,
  nsfw: false,
  options: [
    { name: "user", description: "Target user", type: "user", required: true },
  ],
  async handle(interaction, user) {
    Exemptions.add(user.id)

    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle("Exempted a user from the account age requirement")
          .setDescription(
            `${userMention(
              user.id,
            )} is now exempt from the 30 day account age requirement.`,
          )
          .setFooter({ text: user.id })
          .setTimestamp(Date.now()),
      ],
    })
  },
})
