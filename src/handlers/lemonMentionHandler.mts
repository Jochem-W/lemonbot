import { Drizzle } from "../clients.mjs"
import { InvalidEmbedError } from "../errors.mjs"
import { staticComponent } from "../models/component.mjs"
import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import { dontShowAgain } from "../schema.mjs"
import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  userMention,
  type MessageActionRowComponentBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js"
import { eq } from "drizzle-orm"

const disableReminder = staticComponent({
  type: ComponentType.Button,
  name: "dsa",
  async handle(interaction) {
    const text = interaction.message.embeds[0]?.description
    if (!text) {
      throw new InvalidEmbedError("A verify log embed is invalid")
    }

    const ids = [...text.matchAll(/<@(\d+)>/g)].map(
      (match) => match[1] as string
    )
    await Drizzle.insert(dontShowAgain).values(
      ids.map((id) => ({ lemonId: id, userId: interaction.user.id }))
    )

    const rows = interaction.message.components.map(
      (row) =>
        new ActionRowBuilder<MessageActionRowComponentBuilder>(row.toJSON())
    )

    for (const row of rows) {
      for (const component of row.components) {
        component.setDisabled(true)
      }
    }

    await interaction.update({
      embeds: interaction.message.embeds,
      components: rows,
    })
  },
})

export const LemonMentionHandler = handler({
  event: "messageCreate",
  once: false,
  async handle(message) {
    let matches = []
    for (const id of Config.lemon) {
      if (!message.mentions.has(id)) {
        continue
      }

      matches.push(id)
    }

    if (matches.length === 0) {
      return
    }

    const results = await Drizzle.select()
      .from(dontShowAgain)
      .where(eq(dontShowAgain.userId, message.author.id))

    matches = matches.filter((m) => !results.find((r) => r.lemonId === m))
    if (matches.length === 0) {
      return
    }

    await message.author.send({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `Hey! This is just a reminder to not ping ${matches
              .map(userMention)
              .join(", ")
              .replace(
                /,([^,]*)$/,
                " and$1"
              )} in your message unless it's important!\n\nHere's a demonstration on how to disable pinging when replying:`
          )
          .setImage(
            "https://cdn.discordapp.com/attachments/1125446368002052186/1126865484046929980/chrome_20220423_222431.gif"
          )
          .setFooter({
            text: "If this is understood, you can press the button below to disable this reminder.",
          }),
      ],
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Don't show again")
            .setCustomId(disableReminder)
        ),
      ],
    })
  },
})
