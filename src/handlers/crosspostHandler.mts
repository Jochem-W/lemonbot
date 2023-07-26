import { handler } from "../models/handler.mjs"

export const CrosspostHandler = handler({
  event: "messageCreate",
  once: false,
  async handle(message) {
    if (message.crosspostable) {
      await message.crosspost()
    }
  },
})
