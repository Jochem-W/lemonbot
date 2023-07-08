import { handler } from "../models/handler.mjs"
import { updatePresence } from "../utilities/discordUtilities.mjs"

export const UpdatePresenceOnJoinHandler = handler({
  event: "guildMemberAdd",
  once: false,
  async handle(member) {
    await updatePresence(member.client)
  },
})
