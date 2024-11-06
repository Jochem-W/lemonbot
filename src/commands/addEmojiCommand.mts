import { DownloadError, FileSizeError, MIMETypeError } from "../errors.mjs"
import { slashCommand, slashSubcommand } from "../models/slashCommand.mjs"
import { userDisplayName } from "../utilities/discordUtilities.mjs"
import { interactionGuild } from "../utilities/interactionUtilities.mjs"
import {
  ALLOWED_STICKER_EXTENSIONS,
  EmbedBuilder,
  PermissionFlagsBits,
  formatEmoji,
} from "discord.js"
import { MIMEType } from "util"

const emojiMimeTypes = ["png", "gif", "jpeg"]
const maxEmojiSize = 256 * 1000

const stickerMimeTypes: string[] = [...ALLOWED_STICKER_EXTENSIONS]
const maxStickerSize = 512 * 1000

export const AddEmojiCommand = slashCommand({
  name: "add",
  description: "Add emojis or stickers to the server",
  defaultMemberPermissions: PermissionFlagsBits.ManageGuildExpressions,
  dmPermission: false,
  nsfw: false,
  subcommands: [
    slashSubcommand({
      name: "emoji",
      description: "Add an emoji to the server",
      options: [
        {
          name: "name",
          description: "Name of the emoji",
          type: "string",
          required: true,
        },
        {
          name: "image",
          description: "Emoji image",
          type: "attachment",
          required: true,
        },
        {
          name: "role",
          description: "Role to restrict the emoji to",
          type: "role",
          required: false,
        },
      ],
      async handle(interaction, name, image, role) {
        const guild = await interactionGuild(interaction, true)

        const mime = image.contentType ? new MIMEType(image.contentType) : null
        if (mime && !emojiMimeTypes.includes(mime.subtype)) {
          throw new MIMETypeError(mime)
        }

        if (image.size > maxEmojiSize) {
          throw new FileSizeError(image.size, maxEmojiSize)
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
                formatEmoji(emoji.id, emoji.animated ?? undefined),
              )
              .setFooter({ text: emoji.id })
              .setTimestamp(Date.now()),
          ],
        })
      },
    }),
    slashSubcommand({
      name: "sticker",
      description: "Add a sticker to the server",
      options: [
        {
          name: "name",
          description: "Name of the sticker",
          type: "string",
          required: true,
        },
        {
          name: "tags",
          description:
            "Tags for the sticker, ideally an emoji name without the colons",
          type: "string",
          required: true,
        },
        {
          name: "image",
          description: "Sticker image (GIF, PNG, APNG)",
          type: "attachment",
          required: true,
        },
        {
          name: "description",
          description: "Description for the sticker",
          type: "string",
          required: false,
        },
      ],
      async handle(interaction, name, tags, image, description) {
        const guild = await interactionGuild(interaction, true)

        const mime = image.contentType ? new MIMEType(image.contentType) : null
        if (mime && !stickerMimeTypes.includes(mime.subtype)) {
          throw new MIMETypeError(mime)
        }

        if (image.size > maxStickerSize) {
          throw new FileSizeError(image.size, maxEmojiSize)
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
