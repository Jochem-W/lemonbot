import { Db } from "../clients.mjs"
import { logError } from "../errors.mjs"
import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import { fetchChannel, uniqueName } from "../utilities/discordUtilities.mjs"
import { ChannelType, EmbedBuilder } from "discord.js"
import { readFile, writeFile } from "fs/promises"

type State = "UP" | "DOWN" | "RECREATE"

export const StartupHandler = handler({
  event: "ready",
  once: true,
  async handle(client) {
    console.log(`Running as: ${uniqueName(client.user)}`)

    let title = "Bot "
    switch (await getState()) {
      case "UP":
        title += "crashed"
        break
      case "DOWN":
        title += "restarted"
        break
      case "RECREATE":
        title += "redeployed"
        break
    }

    const message = {
      embeds: [new EmbedBuilder().setTitle(title)],
    }

    const channel = await fetchChannel(
      client,
      Config.channels.restart,
      ChannelType.GuildText,
    )
    await channel.send(message)

    await setState("UP")

    function exitListener() {
      client
        .destroy()
        .then(() => Db.end())
        .then(() => setState("DOWN"))
        .then(() => process.exit())
        .catch((e) => {
          if (e instanceof Error) {
            void logError(client, e)
          } else {
            console.error(e)
          }

          process.exit()
        })
    }

    process.on("SIGINT", () => exitListener())
    process.on("SIGTERM", () => exitListener())
  },
})

type ArbitraryObject = Record<string, unknown>

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return (
    isArbitraryObject(error) &&
    error instanceof Error &&
    (typeof error["errno"] === "number" ||
      typeof error["errno"] === "undefined") &&
    (typeof error["code"] === "string" ||
      typeof error["code"] === "undefined") &&
    (typeof error["path"] === "string" ||
      typeof error["path"] === "undefined") &&
    (typeof error["syscall"] === "string" ||
      typeof error["syscall"] === "undefined")
  )
}

function isArbitraryObject(
  potentialObject: unknown,
): potentialObject is ArbitraryObject {
  return typeof potentialObject === "object" && potentialObject !== null
}

async function setState(status: State) {
  await writeFile("status", status, { encoding: "utf8" })
}

async function getState() {
  try {
    const state = await readFile("status", "utf8")
    if (state !== "UP" && state !== "DOWN" && state !== "RECREATE") {
      return "RECREATE"
    }

    return state
  } catch (e) {
    if (!isErrnoException(e) || e.code !== "ENOENT") {
      throw e
    }

    return "RECREATE"
  }
}
