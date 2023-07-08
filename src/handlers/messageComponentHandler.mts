import { InvalidCustomIdError, logError } from "../errors.mjs"
import { Interactable } from "../interactable.mjs"
import { handler } from "../models/handler.mjs"
import { makeErrorMessage } from "../utilities/embedUtilities.mjs"
import { MessageComponentInteraction } from "discord.js"

async function handleMessageComponent(
  interaction: MessageComponentInteraction
) {
  const [name] = interaction.customId.split(":")
  if (!name) {
    throw new InvalidCustomIdError(interaction.customId)
  }

  const handler = Interactable.get(name)
  if (!handler) {
    throw new InvalidCustomIdError(interaction.customId)
  }

  await handler(interaction)
}

export const MessageComponentHandler = handler({
  event: "interactionCreate",
  once: false,
  async handle(interaction) {
    if (!interaction.isMessageComponent()) {
      return
    }

    try {
      await handleMessageComponent(interaction)
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e
      }

      await logError(interaction.client, e)
      await interaction.editReply(makeErrorMessage(e))
    }
  },
})
