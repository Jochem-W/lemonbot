import { handler } from "../models/handler.mjs"

export const DebugHandler = handler({
  event: "debug",
  once: false,
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async handle(_message) {
    // console.debug(_message)
  },
})
