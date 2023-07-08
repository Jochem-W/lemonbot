import { handler } from "../models/handler.mjs"
import { updatePresence } from "../utilities/discordUtilities.mjs"

export const UpdatePresenceOnStartupHandler = handler({
  event: "ready",
  once: true,
  async handle(client) {
    await updatePresence(client)
  },
})
