import { DownloadError } from "../errors.mjs"
import { originalUserOnlyMessage } from "../messages/originalUserOnlyMessage.mjs"
import { component } from "../models/component.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  type MessageActionRowComponentBuilder,
  type Snowflake,
} from "discord.js"
import gm from "gm"
import { z } from "zod"

const url = "http://colormind.io/api/"
const responseModel = z.object({
  result: z.tuple([
    z.tuple([z.number(), z.number(), z.number()]),
    z.tuple([z.number(), z.number(), z.number()]),
    z.tuple([z.number(), z.number(), z.number()]),
    z.tuple([z.number(), z.number(), z.number()]),
    z.tuple([z.number(), z.number(), z.number()]),
  ]),
})

const size = 100

const regenerate = component({
  type: ComponentType.Button,
  name: "palette",
  async handle(interaction, userId) {
    if (userId !== interaction.user.id) {
      await interaction.reply({
        ...originalUserOnlyMessage(interaction.componentType),
        ephemeral: true,
      })
      return
    }

    await interaction.update(await generate(interaction.user.id))
  },
})

async function generate(userId: Snowflake) {
  const response = await fetch(url, {
    method: "POST",
    body: '{"model":"default"}',
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new DownloadError(url)
  }

  const { result } = await responseModel.parseAsync(await response.json())

  const image = gm.subClass({ imageMagick: "7+" })(
    result.length * size,
    size,
    "#000000",
  )

  const colours = result.map(
    (arr) => `#${arr.map((num) => num.toString(16).padStart(2, "0")).join("")}`,
  )

  let offset = 0
  for (const colour of colours) {
    image.fill(colour).drawRectangle(offset, 0, offset + size, size)
    offset += size
  }

  return {
    components: [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Regenerate")
          .setEmoji("🎨")
          .setCustomId(regenerate(userId)),
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("Here's your random palette!")
        .setImage("attachment://palette.png")
        .setFooter({ text: "colormind.io" })
        .setTimestamp(Date.now()),
    ],
    files: [
      new AttachmentBuilder(image.stream("png"), {
        name: "palette.png",
        description: colours.join(", "),
      }),
    ],
  }
}

export const PaletteCommand = slashCommand({
  name: "palette",
  description: "Generate a random palette",
  defaultMemberPermissions: null,
  dmPermission: true,
  async handle(interaction) {
    await interaction.reply(await generate(interaction.user.id))
  },
})
