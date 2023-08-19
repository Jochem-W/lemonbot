import { Colours } from "../colours.mjs"
import { GuildOnlyError } from "../errors.mjs"
import { userInfoMessage } from "../messages/userInfoMessage.mjs"
import {
  slashCommand,
  slashOption,
  subcommand,
} from "../models/slashCommand.mjs"
import {
  memberDisplayName,
  truncate,
  userDisplayName,
} from "../utilities/discordUtilities.mjs"
import { interactionMember } from "../utilities/interactionUtilities.mjs"
import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandStringOption,
  SlashCommandUserOption,
  TimestampStyles,
  formatEmoji,
  inlineCode,
  roleMention,
  time,
  userMention,
} from "discord.js"

export const InfoCommand = slashCommand({
  name: "info",
  description: "Show information about various server-related things",
  defaultMemberPermissions: null,
  dmPermission: true,
  subcommands: [
    subcommand({
      name: "user",
      description: "Show information about a user",
      options: [
        slashOption(
          false,
          new SlashCommandUserOption()
            .setName("user")
            .setDescription("Target user"),
        ),
      ],
      async handle(interaction, user) {
        await interaction.reply(
          await userInfoMessage(interaction, user ?? undefined),
        )
      },
    }),
    subcommand({
      name: "server",
      description: "Show information about the server",
      async handle(interaction) {
        if (!interaction.inGuild()) {
          throw new GuildOnlyError()
        }

        const onlineEmoji = interaction.client.emojis.cache.find(
          (e) => e.name === "online",
        )
        const offlineEmoji = interaction.client.emojis.cache.find(
          (e) => e.name === "offline",
        )

        let description = ""
        if (onlineEmoji) {
          description += `${formatEmoji(
            onlineEmoji.id,
            onlineEmoji.animated ?? false,
          )} `
        }

        const guild = await interaction.client.guilds.fetch(interaction.guildId)

        description += `${
          guild.presences.cache.filter((p) => p.status === "online").size
        } online\n`

        if (offlineEmoji) {
          description += `${formatEmoji(
            offlineEmoji.id,
            offlineEmoji.animated ?? false,
          )} `
        }

        description += `${guild.memberCount} members`

        const embed = new EmbedBuilder()
          .setTitle(guild.name)
          .setThumbnail(guild.iconURL({ size: 4096 }))
          .setDescription(description)
          .setFields(
            {
              name: "Server created",
              value: time(guild.createdAt, TimestampStyles.ShortDateTime),
              inline: true,
            },
            {
              name: "Server owner",
              value: userMention(guild.ownerId),
              inline: true,
            },
            {
              name: "Roles",
              value: truncate(
                guild.roles.cache
                  .filter((r) => r.id !== guild.roles.everyone.id)
                  .map((r) => roleMention(r.id)),
                1024,
              ),
            },
            {
              name: "Staff",
              value: truncate(
                guild.members.cache
                  .filter(
                    (m) =>
                      !m.user.bot &&
                      m.permissions.has(PermissionFlagsBits.ModerateMembers),
                  )
                  .map((r) => userMention(r.id)),
                1024,
              ),
            },
          )
          .setImage(guild.bannerURL({ size: 4096 }))
          .setFooter({ text: guild.id })
          .setTimestamp(Date.now())

        if (guild.vanityURLCode) {
          embed.addFields({
            name: "Invite link",
            value: new URL(
              guild.vanityURLCode,
              "https://discord.gg/",
            ).toString(),
          })
        }

        await interaction.reply({ embeds: [embed] })
      },
    }),
    subcommand({
      name: "emoji",
      description: "Show information about an emoji",
      options: [
        slashOption(true, {
          option: new SlashCommandStringOption()
            .setName("name")
            .setDescription("Name of the emoji"),
          autocomplete(interaction, { value }) {
            return [...interaction.client.emojis.cache.values()]
              .filter(
                (e) =>
                  e.name?.toLowerCase().includes(value.toLowerCase()) &&
                  e.guild.id === interaction.guildId &&
                  e.roles.cache.size === 0,
              )
              .slice(0, 25)
              .map((e) => ({ name: e.name as string, value: e.id }))
              .sort((a, b) => a.name.localeCompare(b.name))
          },
        }),
      ],
      async handle(interaction, id) {
        const emoji =
          interaction.client.emojis.cache.get(id) ??
          interaction.client.emojis.cache.find((e) => e.name === id)
        if (!emoji || emoji.roles.cache.size > 0) {
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Invalid emoji")
                .setDescription(`The emoji ${inlineCode(id)} doesn't exist!`)
                .setColor(Colours.red[500]),
            ],
          })
          return
        }

        const author = await emoji.fetchAuthor()
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                emoji.name
                  ? `:${emoji.name}:`
                  : formatEmoji(emoji.id, emoji.animated ?? false),
              )
              .setFields({ name: "Uploaded by", value: userMention(author.id) })
              .setThumbnail(emoji.url)
              .setFooter({ text: emoji.id })
              .setTimestamp(Date.now()),
          ],
        })
      },
    }),
    subcommand({
      name: "bot",
      description: "Show information about the bot",
      async handle(interaction) {
        if (!interaction.inGuild()) {
          throw new GuildOnlyError()
        }

        const guild = await interaction.client.guilds.fetch(interaction.guildId)

        const user = interaction.client.user
        const member = await interactionMember(interaction, { user })

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: member
                  ? memberDisplayName(member)
                  : userDisplayName(user),
                iconURL: (member ?? user).displayAvatarURL({ size: 4096 }),
              })
              .setDescription(`Multi-purpose bot for ${guild.name}.`)
              .setFooter({ text: user.id })
              .setTimestamp(Date.now()),
          ],
        })
      },
    }),
  ],
})
