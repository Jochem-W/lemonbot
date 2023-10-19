import { Drizzle } from "../clients.mjs"
import { NoDataError } from "../errors.mjs"
import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import { qotw } from "../schema.mjs"
import { fetchChannel } from "../utilities/discordUtilities.mjs"
import { randomInt } from "crypto"
import {
  ChannelType,
  roleMention,
  type Client,
  bold,
  formatEmoji,
  EmbedBuilder,
} from "discord.js"
import { eq } from "drizzle-orm"
import { DateTime } from "luxon"

function getNextTime() {
  let next = DateTime.now()
    .setZone("CST")
    .set({ weekday: 1, hour: 8 })
    .startOf("hour")
  while (next.diffNow().toMillis() < 0) {
    next = next.plus({ weeks: 1 })
  }

  return next
}

async function sendQotw(client: Client) {
  console.log(32)
  const channel = await fetchChannel(
    client,
    Config.channels.qotw,
    ChannelType.GuildAnnouncement,
  )

  console.log(39)
  const questions = await Drizzle.select().from(qotw)
  if (questions.length === 0) {
    const modGeneral = await fetchChannel(
      client,
      Config.channels.modGeneral,
      ChannelType.GuildText,
    )

    console.log(48)
    await modGeneral.send({
      embeds: [new EmbedBuilder().setTitle("0 QotW questions remaining!")],
    })
    return
  }

  console.log(55)
  const question = questions[randomInt(questions.length)]
  if (!question) {
    throw new NoDataError("No questions")
  }

  console.log(61)
  const rulesEmoji = channel.guild.emojis.cache.find(
    (e) => e.name === "pinned_messages",
  )
  let rulesText = "follow the "
  if (rulesEmoji) {
    rulesText += `${formatEmoji(rulesEmoji.id, rulesEmoji.animated ?? false)} `
  }

  rulesText += "Rules"

  console.log(72)
  const message = await channel.send(
    `${roleMention(
      Config.roles.qotw,
    )} Good morning, everyone! It's time for another question of the week! The one for this week is:\n\n${bold(
      `<${question.body}>`,
    )}\n\nPlease remember to ${bold(
      rulesText,
    )}, and to keep conversations on-topic and civil.\n\nIf you have a question you'd like to see, please submit it at <https://forms.gle/AiPPdedoB91fgPkL6>!\n\n⬇️ ${bold(
      "Send your responses in the attached thread!",
    )} ⬇️`,
  )
  await message.startThread({
    name:
      question.body.length > 100
        ? question.body.substring(0, 99) + "…"
        : question.body,
  })

  console.log(91)
  await Drizzle.delete(qotw).where(eq(qotw.id, question.id))

  console.log(94)
  setTimeout(() => {
    sendQotw(client).catch((e) => console.error(e))
  }, getNextTime().diffNow().toMillis())
}

export const QotwHandler = handler({
  event: "ready",
  once: true,
  handle(client) {
    console.log(
      "Scheduling QoTW",
      getNextTime().diffNow().toMillis(),
      "from now",
    )

    console.log(110)
    setTimeout(() => {
      sendQotw(client).catch((e) => console.error(e))
    }, getNextTime().diffNow().toMillis())
  },
})
