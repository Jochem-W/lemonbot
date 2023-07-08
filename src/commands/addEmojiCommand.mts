import { DownloadError, FileSizeError, MIMETypeError } from "../errors.mjs"
import {
  slashCommand,
  slashOption,
  subcommand,
} from "../models/slashCommand.mjs"
import { userDisplayName } from "../utilities/discordUtilities.mjs"
import { interactionGuild } from "../utilities/interactionUtilities.mjs"
import {
  ALLOWED_STICKER_EXTENSIONS,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandAttachmentOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  formatEmoji,
} from "discord.js"
import MIMEType from "whatwg-mimetype"

const emojiMimeTypes = ["png", "gif", "jpeg"]
const maxEmojiSize = 256 * 1000

const stickerMimeTypes: string[] = [...ALLOWED_STICKER_EXTENSIONS]
const maxStickerSize = 512 * 1000

export const AddEmojiCommand = slashCommand({
  name: "add",
  description: "Add emojis or stickers to the server",
  defaultMemberPermissions: PermissionFlagsBits.ManageGuildExpressions,
  dmPermission: false,
  subcommands: [
    subcommand({
      name: "emoji",
      description: "Add an emoji to the server",
      options: [
        slashOption(
          true,
          new SlashCommandStringOption()
            .setName("name")
            .setDescription("Name of the emoji")
        ),
        slashOption(
          true,
          new SlashCommandAttachmentOption()
            .setName("image")
            .setDescription("Emoji image")
        ),
        slashOption(
          false,
          new SlashCommandRoleOption()
            .setName("role")
            .setDescription("Role to restrict the emoji to")
        ),
      ],
      async handle(interaction, name, image, role) {
        const guild = await interactionGuild(interaction, true)

        const mime = image.contentType ? new MIMEType(image.contentType) : null
        if (mime && !emojiMimeTypes.includes(mime.subtype)) {
          throw new MIMETypeError(mime)
        }

        if (image.size > maxEmojiSize) {
          throw new FileSizeError(maxEmojiSize)
        }

        await interaction.deferReply({ ephemeral: true })
        const response = await fetch(image.url)
        if (!response.ok) {
          throw new DownloadError(image.url)
        }

        const emoji = await guild.emojis.create({
          attachment: Buffer.from(await response.arrayBuffer()),
          name: name.replaceAll(/\s+/g, "-"),
          roles: role ? [role] : [],
          reason: `${userDisplayName(interaction.user)} used /${
            interaction.commandName
          }`,
        })

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Emoji created")
              .setDescription(
                formatEmoji(emoji.id, emoji.animated ?? undefined)
              )
              .setFooter({ text: emoji.id })
              .setTimestamp(Date.now()),
          ],
        })
      },
    }),
    subcommand({
      name: "sticker",
      description: "Add a sticker to the server",
      options: [
        slashOption(
          true,
          new SlashCommandStringOption()
            .setName("name")
            .setDescription("Name of the sticker")
        ),
        slashOption(
          true,
          new SlashCommandStringOption()
            .setName("tags")
            .setDescription(
              "Tags for the sticker, ideally an emoji name without the colons"
            )
        ),
        slashOption(
          true,
          new SlashCommandAttachmentOption()
            .setName("image")
            .setDescription("Sticker image (GIF, PNG, APNG)")
        ),
        slashOption(
          false,
          new SlashCommandStringOption()
            .setName("description")
            .setDescription("Description for the sticker")
        ),
      ],
      async handle(interaction, name, tags, image, description) {
        const guild = await interactionGuild(interaction, true)

        const mime = image.contentType ? new MIMEType(image.contentType) : null
        if (mime && !stickerMimeTypes.includes(mime.subtype)) {
          throw new MIMETypeError(mime)
        }

        if (image.size > maxStickerSize) {
          throw new FileSizeError(maxEmojiSize)
        }

        await interaction.deferReply({ ephemeral: true })
        const response = await fetch(image.url)
        if (!response.ok) {
          throw new DownloadError(image.url)
        }

        const sticker = await guild.stickers.create({
          file: Buffer.from(await response.arrayBuffer()),
          name,
          tags,
          description,
          reason: `${userDisplayName(interaction.user)} used /${
            interaction.commandName
          }`,
        })

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Sticker created")
              .setImage(sticker.url)
              .setFooter({ text: sticker.id })
              .setTimestamp(Date.now()),
          ],
        })
      },
    }),
  ],
})
