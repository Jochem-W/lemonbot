import { Exemptions } from "../handlers/banNewAccountsHandler.mjs"
import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandUserOption,
  userMention,
} from "discord.js"

export const ExemptCommand = slashCommand({
  name: "exempt",
  description: "Exempt a user from the 30 day account age requirement",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  dmPermission: false,
  options: [
    slashOption(
      true,
      new SlashCommandUserOption()
        .setName("user")
        .setDescription("Target user"),
    ),
  ],
  async handle(interaction, user) {
    Exemptions.add(user.id)

    await interaction.reply({
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
