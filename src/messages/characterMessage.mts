import type { selectCharacterSchema } from "../schema.mjs"
import {
  EmbedBuilder,
  TimestampStyles,
  time,
  type Client,
  type EmbedAuthorOptions,
} from "discord.js"
import type { z } from "zod"

export function characterMessage(
  client: Client<true>,
  character: z.infer<typeof selectCharacterSchema>,
) {
  const images = [character.image1, character.image2, character.image3].filter(
    (i) => i,
  ) as string[]

  const embeds = images.map((i) =>
    new EmbedBuilder().setImage(i).setURL("https://discord.gg/zestylemons"),
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
      },
    )
    .setColor(character.colour)

  return { embeds }
}
