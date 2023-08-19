import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import {
  tryFetchMember,
  userDisplayName,
} from "../utilities/discordUtilities.mjs"
import { interactionGuild } from "../utilities/interactionUtilities.mjs"
import {
  DiscordAPIError,
  EmbedBuilder,
  PermissionFlagsBits,
  RESTJSONErrorCodes,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "discord.js"

export const UnbanCommand = slashCommand({
  name: "unban",
  description: "Remove a user's ban",
  defaultMemberPermissions: PermissionFlagsBits.BanMembers,
  dmPermission: false,
  options: [
    slashOption(
      true,
      new SlashCommandUserOption()
        .setName("user")
        .setDescription("The target user"),
    ),
    slashOption(
      false,
      new SlashCommandStringOption()
        .setName("reason")
        .setDescription("The unban reason")
        .setMaxLength(512),
    ),
  ],
  async handle(interaction, user, reason) {
    const guild = await interactionGuild(interaction, true)

    try {
      await guild.bans.remove(user)
    } catch (e) {
      if (
        !(e instanceof DiscordAPIError) ||
        e.code !== RESTJSONErrorCodes.UnknownBan
      ) {
        throw e
      }

      const member = await tryFetchMember(guild, user.id)
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `${userDisplayName(user)} wasn't banned`,
              iconURL: (member ?? user).displayAvatarURL({ size: 4096 }),
            })
            .setFooter({ text: user.id })
            .setTimestamp(Date.now()),
        ],
      })
      return
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Unbanned ${userDisplayName(user)}`,
        iconURL: user.displayAvatarURL({ size: 4096 }),
      })
      .setFooter({ text: user.id })
      .setTimestamp(Date.now())

    if (reason) {
      embed.setFields({ name: "Reason", value: reason })
    }

    await interaction.reply({ ephemeral: true, embeds: [embed] })
  },
})
