import { Drizzle } from "../clients.mjs"
import { NoDataError } from "../errors.mjs"
import { originalUserOnlyMessage } from "../messages/originalUserOnlyMessage.mjs"
import { component } from "../models/component.mjs"
import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import { character } from "../schema.mjs"
import { componentEmoji } from "../utilities/discordUtilities.mjs"
import {
  ActionRowBuilder,
  EmbedBuilder,
  type MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TimestampStyles,
  time,
  ComponentType,
  type EmbedAuthorOptions,
  Client,
  SlashCommandIntegerOption,
} from "discord.js"

let characters = await Drizzle.select().from(character)

export const CharactersCommand = slashCommand({
  name: "characters",
  description: "Browse through Lemon's characters",
  defaultMemberPermissions: null,
  dmPermission: true,
  options: [
    slashOption(
      false,
      new SlashCommandIntegerOption()
        .setName("character")
        .setDescription("Character to view")
        .setChoices(
          ...characters
            .map((c) => ({ name: c.name, value: c.id }))
            .sort((a, b) => a.name.localeCompare(b.name))
        )
    ),
  ],
  async handle(interaction, id) {
    characters = await Drizzle.select().from(character)

    const char = characters.find((c) => c.id === id) ?? characters[0]
    if (!char) {
      throw new NoDataError("No characters")
    }

    await interaction.reply({
      embeds: characterEmbeds(interaction.client, char),
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setOptions(characterOptions(interaction.client, char.id))
            .setCustomId(updateCharacters(interaction.user.id))
        ),
      ],
    })
  },
})

const updateCharacters = component({
  type: ComponentType.StringSelect,
  name: "character",
  async handle(interaction, userId) {
    characters = await Drizzle.select().from(character)

    if (userId !== interaction.user.id) {
      await interaction.reply({
        ...originalUserOnlyMessage(interaction.componentType),
        ephemeral: true,
      })
      return
    }

    if (!interaction.values[0]) {
      await interaction.deferUpdate()
      return
    }

    const id = parseInt(interaction.values[0])

    const char = characters.find((c) => c.id === id)
    if (!char) {
      await interaction.deferUpdate()
      return
    }

    await interaction.update({
      embeds: characterEmbeds(interaction.client, char),
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setOptions(characterOptions(interaction.client, id))
            .setCustomId(updateCharacters(interaction.user.id))
        ),
      ],
    })
  },
})

function characterOptions(client: Client<true>, id: number) {
  const options = characters.map((c) =>
    new StringSelectMenuOptionBuilder()
      .setLabel(c.name)
      .setEmoji(
        componentEmoji(client.emojis.cache.find((e) => e.name === c.icon))
      )
      .setValue(c.id.toString(10))
      .setDescription(
        c.description.length > 100
          ? c.description.substring(0, 99) + "…"
          : c.description
      )
  )

  options.find((o) => o.data.value === id.toString(10))?.setDefault(true)

  return options
}

function characterEmbeds(
  client: Client<true>,
  character: (typeof characters)[0]
) {
  const images = [character.image1, character.image2, character.image3].filter(
    (i) => i
  ) as string[]

  const embeds = images.map((i) =>
    new EmbedBuilder().setImage(i).setURL("https://discord.gg/zestylemons")
  )

  let firstEmbed = embeds[0]
  if (!firstEmbed) {
    firstEmbed = new EmbedBuilder()
    embeds.push(firstEmbed)
  }

  const author: EmbedAuthorOptions = {
    name: character.name,
  }

  if (character.icon) {
    const emoji = client.emojis.cache.find((e) => e.name === character.icon)
    if (emoji) {
      author.iconURL = emoji.url
    }
  }

  firstEmbed
    .setAuthor(author)
    .setThumbnail(character.palette)
    .setDescription(character.description)
    .setFields(
      {
        name: "Pronouns",
        value: character.pronouns,
        inline: true,
      },
      { name: "Created by", value: character.creator, inline: true },
      {
        name: "Created on",
        value: time(character.timestamp, TimestampStyles.LongDate),
        inline: true,
      }
    )
    .setColor(character.colour)

  return embeds
}
