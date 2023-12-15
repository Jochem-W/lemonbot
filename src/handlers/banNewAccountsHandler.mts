import { Colours } from "../colours.mjs"
import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import { LongTimeout } from "../models/longTimeout.mjs"
import {
  EmbedBuilder,
  TimestampStyles,
  time,
  type EmbedAuthorOptions,
} from "discord.js"
import { DateTime } from "luxon"

export const Exemptions = new Set<string>()

export const BanNewAccountsHandler = handler({
  event: "guildMemberAdd",
  once: false,
  async handle(member) {
    if (Exemptions.has(member.id)) {
      return
    }

    const createdAt = DateTime.fromJSDate(member.user.createdAt)
    const remaining = createdAt
      .diffNow()
      .plus({ days: Config.autoBan.days })
      .toMillis()

    if (remaining <= 0) {
      return
    }

    const author: EmbedAuthorOptions = {
      name: member.guild.name,
    }

    const iconURL = member.guild.iconURL()
    if (iconURL) {
      author.iconURL = iconURL
    }

    const embed = new EmbedBuilder()
      .setAuthor(author)
      .setTitle("Your account has been temporarily banned")
      .setDescription(
        "Accounts that are less than 30 days old get automatically banned for safety reasons. The ban will be lifted automatically at the time indicated below.",
      )
      .setFields(
        {
          name: "Account created at",
          value: time(member.user.createdAt, TimestampStyles.ShortDateTime),
          inline: true,
        },
        {
          name: "Can join starting",
          value: time(
            createdAt.plus({ days: Config.autoBan.days }).toJSDate(),
            TimestampStyles.ShortDateTime,
          ),
          inline: true,
        },
      )
      .setColor(Colours.red[500])

    if (member.guild.vanityURLCode) {
      embed.addFields({
        name: "Invite link",
        value: new URL(
          member.guild.vanityURLCode,
          "https://discord.gg/",
        ).toString(),
      })
    }

    await member.send({ embeds: [embed] })
    await member.ban({ reason: Config.autoBan.banReason })

    new LongTimeout(() => {
      member.guild.bans
        .remove(member, Config.autoBan.unbanReason)
        .catch((e) => console.error(e))
    }, remaining)
  },
})
