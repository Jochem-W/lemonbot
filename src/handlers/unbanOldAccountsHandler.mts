import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import { LongTimeout } from "../models/longTimeout.mjs"
import type { FetchBansOptions } from "discord.js"
import { DateTime } from "luxon"

const limit = 1000

export const UnbanOldAccountsHandler = handler({
  event: "ready",
  once: true,
  async handle(client) {
    const guild = await client.guilds.fetch(Config.guild)

    let bans
    let before
    while (!bans || bans.size === limit) {
      const options: FetchBansOptions = { limit }
      if (before) {
        options.before = before
      }

      bans = await guild.bans.fetch(options)
      for (const ban of bans.values()) {
        if (ban.reason !== Config.autoBan.banReason) {
          continue
        }

        const remaining = DateTime.fromJSDate(ban.user.createdAt)
          .diffNow()
          .plus({ days: Config.autoBan.days })
          .toMillis()

        if (remaining <= 0) {
          await guild.bans.remove(ban.user, Config.autoBan.unbanReason)
          continue
        }

        console.log(
          "Set unban timeout for",
          remaining,
          "millis for",
          ban.user.id
        )
        new LongTimeout(() => {
          guild.bans
            .remove(ban.user, Config.autoBan.unbanReason)
            .catch((e) => console.error(e))
        }, remaining)
      }

      before = bans.last()?.user.id
    }
  },
})
