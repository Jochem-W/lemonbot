import { Drizzle } from "../clients.mjs"
import { NoDataError } from "../errors.mjs"
import { characterMessage } from "../messages/characterMessage.mjs"
import { Config } from "../models/config.mjs"
import { modal, modalInput } from "../models/modal.mjs"
import {
  groupedSubcommand,
  slashCommand,
  slashOption,
  subcommandGroup,
} from "../models/slashCommand.mjs"
import { character, selectCharacterSchema } from "../schema.mjs"
import { fetchChannel } from "../utilities/discordUtilities.mjs"
import { uploadAttachment } from "../utilities/s3Utilities.mjs"
import { randomUUID } from "crypto"
import {
  ChannelType,
  Client,
  PermissionFlagsBits,
  SlashCommandAttachmentOption,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js"
import { eq } from "drizzle-orm"
import { DateTime } from "luxon"
import { z } from "zod"

const choices = await Drizzle.select({
  name: character.name,
  value: character.id,
}).from(character)

async function updateMessage(
  client: Client<true>,
  data: z.infer<typeof selectCharacterSchema>,
) {
  const channel = await fetchChannel(
    client,
    Config.channels.characters,
    ChannelType.GuildText,
  )

  await channel.messages.edit(data.message, characterMessage(client, data))
}

const editCharacterDescription = modal({
  id: "ecd",
  title: "Edit character",
  components: [
    modalInput(
      "name",
      true,
      new TextInputBuilder().setLabel("Name").setStyle(TextInputStyle.Short),
    ),
    modalInput(
      "description",
      true,
      new TextInputBuilder()
        .setLabel("Description")
        .setStyle(TextInputStyle.Paragraph),
    ),
    modalInput(
      "pronouns",
      true,
      new TextInputBuilder()
        .setLabel("Pronouns")
        .setStyle(TextInputStyle.Short),
    ),
  ],
  async handle(interaction, { name, description, pronouns }, id) {
    const [data] = await Drizzle.update(character)
      .set({ name, description, pronouns })
      .where(eq(character.id, await z.coerce.number().parseAsync(id)))
      .returning()

    if (!data) {
      throw new NoDataError("No character")
    }

    await interaction.reply({
      ephemeral: true,
      ...characterMessage(interaction.client, data),
    })

    await updateMessage(interaction.client, data)
  },
})

const editCharacterMeta = modal({
  id: "ecm",
  title: "Edit character",
  components: [
    modalInput(
      "creator",
      true,
      new TextInputBuilder()
        .setLabel("Created by")
        .setStyle(TextInputStyle.Short),
    ),
    modalInput(
      "timestamp",
      true,
      new TextInputBuilder()
        .setLabel("Created at")
        .setStyle(TextInputStyle.Short),
    ),
    modalInput(
      "colour",
      true,
      new TextInputBuilder().setLabel("Colour").setStyle(TextInputStyle.Short),
    ),
  ],
  async handle(interaction, { creator, timestamp, colour }, id) {
    const [data] = await Drizzle.update(character)
      .set({
        creator,
        timestamp: DateTime.fromMillis(
          await z.coerce.number().parseAsync(timestamp),
        ).toJSDate(),
        colour: await z.coerce.number().parseAsync(colour),
      })
      .where(eq(character.id, await z.coerce.number().parseAsync(id)))
      .returning()

    if (!data) {
      throw new NoDataError("No character")
    }

    await interaction.reply({
      ephemeral: true,
      ...characterMessage(interaction.client, data),
    })

    await updateMessage(interaction.client, data)
  },
})

export const EditCommand = slashCommand({
  name: "edit",
  description: "Commands related to editing various things",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  dmPermission: false,
  subcommandGroups: [
    subcommandGroup({
      name: "character",
      description: "Commands related to editing characters",
      subcommands: [
        groupedSubcommand({
          name: "info",
          description: "Edit the character name, description or pronouns",
          options: [
            slashOption(
              true,
              slashOption(
                true,
                new SlashCommandIntegerOption()
                  .setName("id")
                  .setDescription("The character's ID")
                  .setChoices(...choices),
              ),
            ),
          ],
          async handle(interaction, id) {
            const [data] = await Drizzle.select()
              .from(character)
              .where(eq(character.id, id))
            if (!data) {
              throw new Error()
            }

            await interaction.showModal(
              editCharacterDescription(
                {
                  name: data.name,
                  description: data.description,
                  pronouns: data.pronouns,
                },
                id.toString(10),
              ),
            )
          },
        }),
        groupedSubcommand({
          name: "meta",
          description: "Edit the character creator, creation time or colour",
          options: [
            slashOption(
              true,
              slashOption(
                true,
                new SlashCommandIntegerOption()
                  .setName("id")
                  .setDescription("The character's ID")
                  .setChoices(...choices),
              ),
            ),
          ],
          async handle(interaction, id) {
            const [data] = await Drizzle.select()
              .from(character)
              .where(eq(character.id, id))
            if (!data) {
              throw new Error()
            }

            await interaction.showModal(
              editCharacterMeta(
                {
                  creator: data.creator,
                  timestamp: DateTime.fromJSDate(data.timestamp)
                    .toMillis()
                    .toString(10),
                  colour: data.colour.toString(10),
                },
                id.toString(10),
              ),
            )
          },
        }),
        groupedSubcommand({
          name: "images",
          description: "Edit the character icon, palette and images",
          options: [
            slashOption(
              true,
              new SlashCommandIntegerOption()
                .setName("id")
                .setDescription("The character's ID")
                .setChoices(...choices),
            ),
            slashOption(false, {
              option: new SlashCommandStringOption()
                .setName("icon")
                .setDescription("The character's icon"),
              autocomplete(interaction, { value }) {
                return [...interaction.client.emojis.cache.values()]
                  .filter(
                    (e) =>
                      e.name?.toLowerCase().includes(value.toLowerCase()) &&
                      e.guild.id === interaction.guildId,
                  )
                  .slice(0, 25)
                  .map((e) => ({ name: e.name as string, value: e.id }))
                  .sort((a, b) => a.name.localeCompare(b.name))
              },
            }),
            slashOption(
              false,
              new SlashCommandAttachmentOption()
                .setName("palette")
                .setDescription("The character's palette"),
            ),
            slashOption(
              false,
              new SlashCommandAttachmentOption()
                .setName("image1")
                .setDescription("The character's first image"),
            ),
            slashOption(
              false,
              new SlashCommandAttachmentOption()
                .setName("image3")
                .setDescription("The character's second image"),
            ),
            slashOption(
              false,
              new SlashCommandAttachmentOption()
                .setName("image2")
                .setDescription("The character's third image"),
            ),
          ],
          async handle(interaction, id, icon, palette, image1, image2, image3) {
            await interaction.deferReply({ ephemeral: true })

            let changes = {}
            if (icon) {
              changes = { ...changes, icon }
            }

            if (palette) {
              const url = await uploadAttachment(
                Config.s3.bucket,
                randomUUID(),
                palette,
              )
              changes = { ...changes, palette: url.toString() }
            }

            if (image1) {
              const url = await uploadAttachment(
                Config.s3.bucket,
                randomUUID(),
                image1,
              )
              changes = { ...changes, image1: url.toString() }
            }

            if (image2) {
              const url = await uploadAttachment(
                Config.s3.bucket,
                randomUUID(),
                image2,
              )
              changes = { ...changes, image2: url.toString() }
            }

            if (image3) {
              const url = await uploadAttachment(
                Config.s3.bucket,
                randomUUID(),
                image3,
              )
              changes = { ...changes, image3: url.toString() }
            }

            if (Object.keys(changes).length === 0) {
              await interaction.editReply("Nothing to update!")
              return
            }

            const [data] = await Drizzle.update(character)
              .set(changes)
              .where(eq(character.id, id))
              .returning()

            if (!data) {
              throw new NoDataError("No character")
            }

            await interaction.editReply({
              ...characterMessage(interaction.client, data),
            })

            await updateMessage(interaction.client, data)
          },
        }),
      ],
    }),
  ],
})
