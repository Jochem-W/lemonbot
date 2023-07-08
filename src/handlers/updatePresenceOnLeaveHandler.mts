import { handler } from "../models/handler.mjs"
import { updatePresence } from "../utilities/discordUtilities.mjs"

export const UpdatePresenceOnLeaveHandler = handler({
  event: "guildMemberRemove",
  once: false,
  async handle(member) {
    await updatePresence(member.client)
  },
})
