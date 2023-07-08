import { RegisteredCommands } from "../commands.mjs"
import {
  CommandNotFoundByIdError,
  NoAutocompleteHandlerError,
} from "../errors.mjs"
import { handler } from "../models/handler.mjs"

export const AutocompleteHandler = handler({
  event: "interactionCreate",
  once: false,
  async handle(interaction) {
    if (!interaction.isAutocomplete()) {
      return
    }

    const command = RegisteredCommands.get(interaction.commandId)
    if (!command) {
      throw new CommandNotFoundByIdError(interaction.commandId)
    }

    if (!("autocomplete" in command)) {
      throw new NoAutocompleteHandlerError(interaction)
    }

    await command.autocomplete(interaction)
  },
})
