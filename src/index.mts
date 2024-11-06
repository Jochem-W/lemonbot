import { logError } from "./errors.mjs"
import { Handlers } from "./handlers.mjs"
import { Handler } from "./models/handler.mjs"
import { Variables } from "./variables.mjs"
import { Client, ClientEvents, GatewayIntentBits, Partials } from "discord.js"

const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.ThreadMember,
  ],
})
discord.rest.setToken(Variables.discordBotToken)

async function listener<T extends keyof ClientEvents>(
  handler: Handler<T>,
  ...args: ClientEvents[T]
) {
  try {
    if (handler.event === "ready") {
      await new Promise((r) => setTimeout(r, 5000))
    }

    await handler.handle(...args)
  } catch (e) {
    if (!(e instanceof Error)) {
      throw e
    }

    await logError(discord, e)
  }
}

for (const handler of Handlers) {
  if (handler.once) {
    discord.once(handler.event, (...args) => void listener(handler, ...args))
    continue
  }

  discord.on(handler.event, (...args) => void listener(handler, ...args))
}

await discord.login(Variables.discordBotToken)
