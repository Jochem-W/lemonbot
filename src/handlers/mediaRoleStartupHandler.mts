import { InvalidRoleError } from "../errors.mjs"
import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import { fetchChannel } from "../utilities/discordUtilities.mjs"
import { giveMediaRole } from "./mediaRoleHandler.mjs"
import { ChannelType, type FetchMessagesOptions } from "discord.js"
import { DateTime } from "luxon"

const limit = 100

export const MediaRoleStartupHandler = handler({
  event: "ready",
  once: true,
  async handle(client) {
    const guild = await client.guilds.fetch(Config.guild)
    const role = await guild.roles.fetch(Config.roles.media)
    if (!role) {
      throw new InvalidRoleError(Config.roles.media)
    }

    const channel = await fetchChannel(
      client,
      Config.logs.verify,
      ChannelType.GuildText
    )

    let before
    let messages
    let stop = false
    while (!stop && (!messages || messages.size === limit)) {
      const options: FetchMessagesOptions = { limit }
      if (before) {
        options.before = before
      }

      messages = await channel.messages.fetch({ limit })
      for (const message of messages.values()) {
        if (!message.author.bot) {
          continue
        }

        const embed = message.embeds[0]
        if (embed?.color !== null && embed?.color !== 2829617) {
          stop = true
          break
        }

        if (!embed.timestamp) {
          continue
        }

        const footer = embed.footer
        if (!footer) {
          continue
        }

        const remaining = DateTime.fromISO(embed.timestamp)
          .diffNow()
          .plus({ days: 1 })
          .toMillis()

        if (remaining <= 0) {
          await giveMediaRole(guild, role, message, footer.text).catch((e) =>
            console.error(e)
          )
          continue
        }

        console.log(
          "Set media role timeout for",
          remaining,
          "millis for",
          footer.text
        )
        setTimeout(() => {
          giveMediaRole(guild, role, message, footer.text).catch((e) =>
            console.error(e)
          )
        }, remaining)
      }

      before = messages.last()?.id
    }
  },
})
