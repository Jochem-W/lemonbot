import {
  MessageContextMenuCommands,
  RegisteredCommands,
  SlashCommands,
  UserContextMenuCommands,
} from "../commands.mjs"
import { CommandNotFoundError } from "../errors.mjs"
import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import type { Command } from "../types/command.mjs"
import { Variables } from "../variables.mjs"
import {
  Routes,
  type RESTPutAPIApplicationGuildCommandsJSONBody,
  ApplicationCommandType,
  type RESTPutAPIApplicationGuildCommandsResult,
} from "discord.js"

export const RegisterCommands = handler({
  event: "ready",
  once: true,
  async handle(client) {
    const commandsBody: RESTPutAPIApplicationGuildCommandsJSONBody = []
    for (const command of [
      ...SlashCommands,
      ...MessageContextMenuCommands,
      ...UserContextMenuCommands,
    ]) {
      commandsBody.push(command.builder.toJSON())
      console.log(`Constructed command '${command.builder.name}'`)
    }

    const route =
      Variables.nodeEnv === "production"
        ? Routes.applicationCommands(Config.applicationId)
        : Routes.applicationGuildCommands(Config.applicationId, Config.guild)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const applicationCommands = (await client.rest.put(route, {
      body: commandsBody,
    })) as RESTPutAPIApplicationGuildCommandsResult
    console.log("Commands updated")
    for (const applicationCommand of applicationCommands) {
      let command: Command<ApplicationCommandType> | undefined
      switch (applicationCommand.type) {
        case ApplicationCommandType.ChatInput:
          command = SlashCommands.find(
            (command) => command.builder.name === applicationCommand.name
          )
          break
        case ApplicationCommandType.User:
          command = UserContextMenuCommands.find(
            (command) => command.builder.name === applicationCommand.name
          )
          break
        case ApplicationCommandType.Message:
          command = MessageContextMenuCommands.find(
            (command) => command.builder.name === applicationCommand.name
          )
          break
      }

      if (!command) {
        throw new CommandNotFoundError(applicationCommand.name)
      }

      RegisteredCommands.set(applicationCommand.id, command)
    }
  },
})
