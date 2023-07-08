import { NoDataError } from "../errors.mjs"
import { originalUserOnlyMessage } from "../messages/originalUserOnlyMessage.mjs"
import { component } from "../models/component.mjs"
import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import { componentEmoji } from "../utilities/discordUtilities.mjs"
import {
  ActionRowBuilder,
  EmbedBuilder,
  type MessageActionRowComponentBuilder,
  SlashCommandStringOption,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TimestampStyles,
  hyperlink,
  time,
  ComponentType,
  type EmbedAuthorOptions,
  Client,
} from "discord.js"
import { DateTime } from "luxon"

type Character = {
  creator: string
  colour: number
  description: string
  emoji: string
  images: string[]
  name: string
  palette: string
  pronouns: string
  timestamp: DateTime
}

const characters: Character[] = [
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0xff525e,
    description:
      "Your local demon cat. He has horns underneath that headband! Although they are partly demon, Kuiper is still not as evil as you'd think she is.",
    emoji: "kuiper",
    images: [
      "https://pbs.twimg.com/media/FkYFNCrWIAEDcvj?format=jpg&name=large",
      "https://pbs.twimg.com/media/Fbgj0X4WQAATq5w?format=jpg&name=large",
      "https://pbs.twimg.com/media/FmJYEAJWIAcqv_d?format=jpg&name=large",
    ],
    name: "Kuiper",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127299153576337499/kuiper_1.png",

    pronouns: "Any pronouns",
    timestamp: DateTime.fromObject({ year: 2021, month: 12, day: 15 }),
  },
  {
    creator: hyperlink("@skullmutt", "https://twitter.com/skullmutt"),
    colour: 0x72e387,
    description:
      "Half skeleton, half fluffy! This cat can glow in the dark, and is perfect for halloween since he doesn't have to spend money on costumes!",
    emoji: "erwin",
    images: [
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127299068423569568/FjmcX7cX0AMm8WY.jpg",
      "https://pbs.twimg.com/media/Fj6Itl_WIAEv7iz?format=jpg&name=large",
      "https://pbs.twimg.com/media/FmfL7LfXEAEv1S7?format=jpg&name=large",
    ],
    name: "Erwin",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127299014447083591/erwin_1.png",
    pronouns: "Any pronouns",
    timestamp: DateTime.fromObject({ year: 2022, month: 12, day: 10 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0xfee177,
    description:
      "A bee, AND a cat! This fella loves flowers and (sometimes) his brother. Don't call him short.",
    emoji: "beecat",
    images: [
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298967131140267/IMG_4561.jpg",
      "https://pbs.twimg.com/media/FnXky_BWAAA0LQk?format=png",
      "https://pbs.twimg.com/media/FhfhdWmX0AA5-27?format=png",
    ],
    name: "Beecat",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298913406287872/beecat_1.png",
    pronouns: "he/him",
    timestamp: DateTime.fromObject({ year: 2020, month: 8, day: 21 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0xfecc67,
    description:
      "Although he is part wasp, Waspdog is as sweet as can be! He is mischievous and a bit silly and devilish, but would never bite or sting. The worst he does is enact in sibling rivalry with his brother, Beecat.",
    emoji: "waspdog",
    images: [
      "https://pbs.twimg.com/media/FVkmnqhX0AMQYWb?format=jpg&name=large",
      "https://pbs.twimg.com/media/FMS4AEOXsAEm3Nw?format=jpg&name=large",
      "https://pbs.twimg.com/media/FJPZE3hX0AEIK-J?format=jpg&name=large",
    ],
    name: "Waspdog",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298864592990439/waspdog_1.png",
    pronouns: "he/him",
    timestamp: DateTime.fromObject({ year: 2021, month: 9, day: 1 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0x7ff3fe,
    description:
      "Your local server Protogen. He CAN run a google search on the spot if you politely ask them for it.",
    emoji: "syntax",
    images: [
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298812373913751/IMG_4562.jpg",
      "https://pbs.twimg.com/media/FQ9M2uLWUAEnbNu?format=jpg&name=large",
      "https://pbs.twimg.com/media/FWg82V5WQAE9igu?format=jpg&name=large",
    ],
    name: "Syntax",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298757806010398/syntax_1.png",
    pronouns: "Any pronouns",
    timestamp: DateTime.fromObject({ year: 2022, month: 2, day: 23 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0xff4d63,
    description:
      "Syntax's evil brother, Error! Now don't worry, he doesn't hack multi-million-dollar companies, they just want to steal from the local best buy.",
    emoji: "error",
    images: [
      "https://pbs.twimg.com/media/FZLb-pwXkAIQLhI?format=jpg&name=large",
      "https://pbs.twimg.com/media/FcZVN8UXoAAUl-f?format=jpg&name=large",
      "https://pbs.twimg.com/media/Fb_iWIXWAAIKQ5V?format=jpg&name=large",
    ],
    name: "Error",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298695466061844/error_1.png",
    pronouns: "Any pronouns",
    timestamp: DateTime.fromObject({ year: 2022, month: 7, day: 31 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0xf3ffff,
    description:
      "A Ghost Cat, also friends with Kuiper, they hang out sometimes! No unfinished business here, he is a guide for the lost souls of kittens gone before their time. They seem to like him.",
    emoji: "fjord",
    images: [
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298584694489148/IMG_4559.jpg",
      "https://pbs.twimg.com/media/FfM9-cjXEAUdAhz?format=jpg&name=large",
      "https://pbs.twimg.com/media/FSaOe_RWQAAWWd4?format=jpg&name=large",
    ],
    name: "Fjord",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127299278621114538/fjord_1.png",
    pronouns: "he/him",
    timestamp: DateTime.fromObject({ year: 2021, month: 6, day: 11 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0x7e92db,
    description:
      "She's a shy dragon and gets flustered a lot! Despite this, she does not stutter over space facts one bit.",
    emoji: "cirrus",
    images: [
      "https://pbs.twimg.com/media/FZlU5bOWAAAn8aa?format=jpg&name=large",
      "https://pbs.twimg.com/media/Fp67dXfXsAERGzV?format=jpg&name=large",
      "https://pbs.twimg.com/media/FbL9uzUUEAI8s5w?format=jpg&name=large",
    ],
    name: "Cirrus",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298332235157604/cirrus_1.png",
    pronouns: "she/her",
    timestamp: DateTime.fromObject({ year: 2022, month: 7, day: 4 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0xac3b33,
    description:
      "Local Ferret that Commits Crimes™ He isn't that mean though, he just likes to threaten with his bat and be on their way.",
    emoji: "kade",
    images: [
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298256746074184/IMG_4661.png",
      "https://pbs.twimg.com/media/FO8tjJGWQAAzkr2?format=jpg&name=large",
      "https://pbs.twimg.com/media/Fd7ZNLpWAAkYosX?format=jpg&name=large",
    ],
    name: "Kade",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298178522304512/kade_1.png",
    pronouns: "he/they",
    timestamp: DateTime.fromObject({ year: 2022, month: 8, day: 17 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0xffeca1,
    description:
      "He was named on a Wednesday! Not much to say about this little guy, he is quite silly though.",
    emoji: "friday",
    images: [
      "https://pbs.twimg.com/media/FBByvsEUcAg8KMb?format=jpg&name=medium",
      "https://pbs.twimg.com/media/FQUV65pWQAYKCNo?format=jpg&name=large",
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127298099895873586/IMG_4564.jpg",
    ],
    name: "Friday",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127297993129853038/friday.png",
    pronouns: "he/him",
    timestamp: DateTime.fromObject({ year: 2022, month: 6, day: 16 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0x68ffff,
    description:
      "A robocat made to assist a now abandoned chemical plant. She's quite reserved, and doesn't talk to bio-organisms much, but i'm sure she'll like you :)",
    emoji: "indi",
    images: [
      "https://pbs.twimg.com/media/EzbgvOQXEAAGkck?format=jpg&name=large",
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127297909243789382/image0_1.jpg",
      "https://pbs.twimg.com/media/E9upOIwXoAIHsEv?format=jpg&name=large",
    ],
    name: "Indi",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127297839601549392/indium.png",
    pronouns: "she/they",
    timestamp: DateTime.fromObject({ year: 2020, month: 8, day: 17 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0xff3b92,
    description:
      "Sometime, somewhere, somehow, someone. Demon? cat? It just exists, shapeshifting properties.",
    emoji: "sometime",
    images: [
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127297739831640164/8409148C-03A8-4EB1-81C7-23C7DFDDF85D.png",
    ],
    name: "Sometime",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127297646751666266/sometime_1.png",
    pronouns: "Any pronouns",
    timestamp: DateTime.fromObject({ year: 2022, month: 4, day: 16 }),
  },
  {
    creator: hyperlink("@ZestyLemonss", "https://twitter.com/ZestyLemonss"),
    colour: 0x9b70b7,
    description:
      "A space calico! He is a nerd for space and science stuff, and is even made out of star dust!",
    emoji: "atom",
    images: [
      "https://pbs.twimg.com/media/FgQdX3bX0AYb1_J?format=jpg&name=large",
      "https://pbs.twimg.com/media/E2FaxxWXoAcs_8I?format=jpg&name=large",
      "https://pbs.twimg.com/media/E2LDHYgWUAAXW1I?format=jpg&name=large",
    ],
    name: "Atom",
    palette:
      "https://cdn.discordapp.com/attachments/1125446368002052186/1127297563951890462/atom_pattern.png",
    pronouns: "he/him",
    timestamp: DateTime.fromObject({ year: 2021, month: 5, day: 23 }),
  },
]

export const CharactersCommand = slashCommand({
  name: "characters",
  description: "Browse through Lemon's characters",
  defaultMemberPermissions: null,
  dmPermission: true,
  options: [
    slashOption(
      false,
      new SlashCommandStringOption()
        .setName("character")
        .setDescription("Character to view")
        .setChoices(
          ...characters
            .map((c) => ({ name: c.name, value: c.name }))
            .sort((a, b) => a.name.localeCompare(b.name))
        )
    ),
  ],
  async handle(interaction, characterName) {
    let characterIndex = characters.findIndex((c) => c.name === characterName)
    if (characterIndex < 0) {
      characterIndex = 0
    }

    const character = characters[characterIndex]
    if (!character) {
      throw new NoDataError("No characters")
    }

    await interaction.reply({
      embeds: characterEmbeds(interaction.client, character),
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setOptions(characterOptions(interaction.client, characterIndex))
            .setCustomId(updateCharacters(interaction.user.id))
        ),
      ],
    })
  },
})

const updateCharacters = component<[string], ComponentType.StringSelect>({
  type: ComponentType.StringSelect,
  name: "character",
  async handle(interaction, userId) {
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

    const characterIndex = parseInt(interaction.values[0])
    const character = characters[characterIndex]
    if (!character) {
      await interaction.deferUpdate()
      return
    }

    await interaction.update({
      embeds: characterEmbeds(interaction.client, character),
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setOptions(characterOptions(interaction.client, characterIndex))
            .setCustomId(updateCharacters(interaction.user.id))
        ),
      ],
    })
  },
})

function characterOptions(client: Client<true>, index: number) {
  const options = characters.map((c, i) =>
    new StringSelectMenuOptionBuilder()
      .setLabel(c.name)
      .setEmoji(
        componentEmoji(client.emojis.cache.find((e) => e.name === c.emoji))
      )
      .setValue(i.toString(10))
      .setDescription(
        c.description.length > 100
          ? c.description.substring(0, 99) + "…"
          : c.description
      )
  )

  options[index]?.setDefault(true)

  return options
}

function characterEmbeds(client: Client<true>, character: Character) {
  const embeds = character.images.map((i) =>
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

  if (character.emoji) {
    const emoji = client.emojis.cache.find((e) => e.name === character.emoji)
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
        value: time(character.timestamp.toJSDate(), TimestampStyles.LongDate),
        inline: true,
      }
    )
    .setColor(character.colour)

  return embeds
}
