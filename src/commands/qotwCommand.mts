import { Drizzle } from "../clients.mjs"
import { Colours } from "../colours.mjs"
import {
  slashCommand,
  slashOption,
  subcommand,
} from "../models/slashCommand.mjs"
import { qotw } from "../schema.mjs"
import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  inlineCode,
} from "discord.js"
import { asc, desc, eq } from "drizzle-orm"

async function autocompleteQuestions(value: string) {
  const questions = await Drizzle.select().from(qotw).orderBy(asc(qotw.body))
  return questions
    .filter((r) => r.body.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 25)
    .map((r) => ({
      name: r.body.length > 100 ? r.body.substring(0, 99) + "…" : r.body,
      value: r.id,
    }))
}

export const QotwCommand = slashCommand({
  name: "qotw",
  description: "Commands related to QotW",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  dmPermission: false,
  subcommands: [
    subcommand({
      name: "add",
      description: "Add a question to the QotW list",
      options: [
        slashOption(
          true,
          new SlashCommandStringOption()
            .setName("body")
            .setDescription("The body of the question")
        ),
      ],
      async handle(interaction, body) {
        const [question] = await Drizzle.insert(qotw)
          .values({ body })
          .returning()

        const embed = new EmbedBuilder()
          .setTitle("Question added")
          .setTimestamp(Date.now())
        if (question) {
          embed
            .setDescription(question.body)
            .setFooter({ text: question.id.toString(10) })
        }

        await interaction.reply({ embeds: [embed] })
      },
    }),
    subcommand({
      name: "remove",
      description: "Remove a question from the QotW list",
      options: [
        slashOption(true, {
          option: new SlashCommandIntegerOption()
            .setName("id")
            .setDescription("The id of the question"),
          async autocomplete(_interaction, { value }) {
            return await autocompleteQuestions(value)
          },
        }),
      ],
      async handle(interaction, id) {
        const [question] = await Drizzle.delete(qotw)
          .where(eq(qotw.id, id))
          .returning()

        const embed = new EmbedBuilder()
          .setTitle("Question removed")
          .setTimestamp(Date.now())
        if (question) {
          embed
            .setDescription(question.body)
            .setFooter({ text: question.id.toString(10) })
        }

        await interaction.reply({ embeds: [embed] })
      },
    }),
    subcommand({
      name: "edit",
      description: "Edit a question in the QotW list",
      options: [
        slashOption(true, {
          option: new SlashCommandIntegerOption()
            .setName("id")
            .setDescription("The id of the question"),
          async autocomplete(_interaction, { value }) {
            return await autocompleteQuestions(value)
          },
        }),
        slashOption(
          true,
          new SlashCommandStringOption()
            .setName("body")
            .setDescription("The new body of the question")
        ),
      ],
      async handle(interaction, id, body) {
        const [question] = await Drizzle.select()
          .from(qotw)
          .where(eq(qotw.id, id))
        if (!question) {
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Invalid question")
                .setDescription(
                  `Question with ID ${inlineCode(
                    id.toString(10)
                  )} doesn't exist`
                )
                .setTimestamp(Date.now())
                .setColor(Colours.red[500]),
            ],
          })
          return
        }

        await Drizzle.update(qotw).set({ body }).where(eq(qotw.id, id))

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Question edited")
              .setFields(
                { name: "Old body", value: question.body },
                { name: "New body", value: body }
              )
              .setFooter({ text: id.toString(10) })
              .setTimestamp(Date.now()),
          ],
        })
      },
    }),
    subcommand({
      name: "list",
      description: "List all QotW questions",
      async handle(interaction) {
        const questions = await Drizzle.select()
          .from(qotw)
          .orderBy(desc(qotw.id))
        let noun = "question"
        if (questions.length !== 1) {
          noun += "s"
        }

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Questions")
              .setDescription(
                questions.map((q) => `- ${q.body}`).join("\n") || null
              )
              .setFooter({ text: `${questions.length} ${noun}` })
              .setTimestamp(Date.now()),
          ],
        })
      },
    }),
  ],
})
