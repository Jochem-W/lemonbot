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
      ChannelType.GuildText,
    )

    const options: FetchMessagesOptions = { limit }
    let stop = false
    while (!stop) {
      const messages = await channel.messages.fetch(options)
      for (const message of messages.values()) {
        options.before = message.id

        const embed = message.embeds[0]
        if (!message.author.bot) {
          continue
        }

        if (embed?.color) {
          stop = true
          break
        }

        if (!embed?.timestamp) {
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
            console.error(e),
          )
          continue
        }

        console.log(
          "Set media role timeout for",
          remaining,
          "millis for",
          footer.text,
        )
        setTimeout(() => {
          giveMediaRole(guild, role, message, footer.text).catch((e) =>
            console.error(e),
          )
        }, remaining)
      }
    }
  },
})
