import { Colours } from "../colours.mjs"
import { NoDataError } from "../errors.mjs"
import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import { interactionMember } from "../utilities/interactionUtilities.mjs"
import { randomInt } from "crypto"
import { EmbedBuilder, SlashCommandStringOption } from "discord.js"

type Response = {
  text: string
  type: "affirmative" | "non-committal" | "negative"
}

const responses: Response[] = [
  { text: "It is certain", type: "affirmative" },
  { text: "It is decidedly so", type: "affirmative" },
  { text: "Without a doubt", type: "affirmative" },
  { text: "Yes definitely", type: "affirmative" },
  { text: "You may rely on it", type: "affirmative" },
  { text: "As I see it, yes", type: "affirmative" },
  { text: "Most likely", type: "affirmative" },
  { text: "Outlook good", type: "affirmative" },
  { text: "Yes", type: "affirmative" },
  { text: "Signs point to yes", type: "affirmative" },
  { text: "Reply hazy, try again", type: "non-committal" },
  { text: "Ask again later", type: "non-committal" },
  { text: "Better not tell you now", type: "non-committal" },
  { text: "Cannot predict now", type: "non-committal" },
  { text: "Concentrate and ask again", type: "non-committal" },
  { text: "Don't count on it", type: "negative" },
  { text: "My reply is no", type: "negative" },
  { text: "My sources say no", type: "negative" },
  { text: "Outlook not so good", type: "negative" },
  { text: "Very doubtful", type: "negative" },
]

export const EightBallCommand = slashCommand({
  name: "8ball",
  description: "Ask the Magic 8 Ball a question",
  defaultMemberPermissions: null,
  dmPermission: true,
  options: [
    slashOption(
      true,
      new SlashCommandStringOption()
        .setName("question")
        .setDescription("The question you'd like to ask")
        .setMaxLength(255)
    ),
  ],
  async handle(interaction, question) {
    const response = responses[randomInt(responses.length)]
    if (!response || !question[0]) {
      throw new NoDataError("No responses")
    }

    if (question.startsWith(question[0].toLowerCase())) {
      question = question[0].toUpperCase() + question.substring(1)
    }

    if (!question.endsWith("?")) {
      question += "?"
    }

    const member = await interactionMember(interaction)

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: question,
            iconURL: (member ?? interaction.user).displayAvatarURL(),
          })
          .setTitle(`🎱 ${response.text}`)
          .setColor(
            response.type === "affirmative"
              ? Colours.green[500]
              : response.type === "non-committal"
              ? Colours.amber[500]
              : Colours.red[500]
          )
          .setTimestamp(Date.now()),
      ],
    })
  },
})
