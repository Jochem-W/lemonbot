import { DuplicateNameError } from "../errors.mjs"
import { Modals } from "../modals.mjs"
import { ModalSubmitInteraction } from "discord.js"

export function staticModal<T extends string>({
  name,
  handle,
}: {
  name: T
  handle: (interaction: ModalSubmitInteraction) => Promise<void>
}) {
  if (Modals.has(name)) {
    throw new DuplicateNameError(name)
  }

  Modals.set(name, async (interaction) => {
    if (!interaction.isModalSubmit()) {
      return
    }

    await handle(interaction)
  })

  return name
}

export function modal<T extends readonly string[]>({
  name,
  handle,
}: {
  name: string
  handle: (interaction: ModalSubmitInteraction, ...args: T) => Promise<void>
}) {
  if (Modals.has(name)) {
    throw new DuplicateNameError(name)
  }

  Modals.set(name, async (interaction) => {
    if (!interaction.isModalSubmit()) {
      return
    }

    await handle(
      interaction,
      ...(interaction.customId.split(":").slice(1) as [...T])
    )
  })

  function generateCustomId(...args: T) {
    return `${name}:${args.join(":")}`
  }

  return generateCustomId
}
