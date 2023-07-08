import { RegisteredCommands } from "../commands.mjs"
import {
  CommandNotFoundByIdError,
  NoPermissionError,
  logError,
} from "../errors.mjs"
import { handler } from "../models/handler.mjs"
import { makeErrorMessage } from "../utilities/embedUtilities.mjs"
import { CommandInteraction } from "discord.js"

async function handleCommand(interaction: CommandInteraction) {
  const command = RegisteredCommands.get(interaction.commandId)
  if (!command) {
    throw new CommandNotFoundByIdError(interaction.commandId)
  }

  if (
    command.builder.default_member_permissions &&
    !interaction.memberPermissions?.has(
      BigInt(command.builder.default_member_permissions),
      true
    )
  ) {
    throw new NoPermissionError()
  }

  await command.handle(interaction as never)
}

export const CommandHandler = handler({
  event: "interactionCreate",
  once: false,
  async handle(interaction) {
    if (!interaction.isCommand()) {
      return
    }

    try {
      await handleCommand(interaction)
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e
      }

      await logError(interaction.client, e)
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(makeErrorMessage(e))
      } else {
        await interaction.reply({
          ...makeErrorMessage(e),
          ephemeral: true,
        })
      }
    }
  },
})
