import { Config } from "./models/config.mjs"
import type { Command } from "./types/command.mjs"
import { makeErrorMessage } from "./utilities/embedUtilities.mjs"
import {
  Attachment,
  ChannelType,
  CommandInteraction,
  type Channel,
  type Snowflake,
  ApplicationCommandType,
  AutocompleteInteraction,
  type AutocompleteFocusedOption,
  ApplicationCommandOptionBase,
  ComponentType,
  Client,
} from "discord.js"
import type { DateTime } from "luxon"
import type MIMEType from "whatwg-mimetype"

class CustomError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class DownloadError extends CustomError {
  public constructor(url: string) {
    super(`Failed to download ${url}`)
  }
}

export class FileSizeError extends CustomError {
  public constructor(max: number) {
    super(`The file size exceeds the maximum file size of ${max} bytes`)
  }
}

export class MIMETypeError extends CustomError {
  public constructor(type: MIMEType) {
    super(`The MIME type ${type.essence} is invalid`)
  }
}

export class NotImplementedError extends CustomError {
  public constructor(message: string) {
    super(message)
  }
}

export class BotError extends CustomError {
  public constructor(message: string) {
    super(message)
  }
}

export class InvalidArgumentsError extends BotError {
  public constructor(message: string) {
    super(message)
  }
}

export class CommandNotFoundError extends BotError {
  public constructor(message: string) {
    super(message)
  }
}

export class CommandNotFoundByIdError extends CommandNotFoundError {
  public constructor(commandId: string) {
    super(`Command with ID "${commandId}" couldn't be found.`)
  }
}

export class CommandNotFoundByNameError extends CommandNotFoundError {
  public constructor(commandName: string) {
    super(`Command with name "${commandName}" couldn't be found.`)
  }
}

export class SubcommandGroupNotFoundError extends BotError {
  public constructor(
    interaction: CommandInteraction | AutocompleteInteraction,
    subcommandGroup: string
  ) {
    super(
      `Couldn't find subcommand group ${subcommandGroup} for command ${interaction.commandName} (${interaction.commandId})`
    )
  }
}

export class SubcommandNotFoundError extends BotError {
  public constructor(
    interaction: CommandInteraction | AutocompleteInteraction,
    subcommand: string
  ) {
    super(
      `Couldn't find subcommand ${subcommand} for command ${interaction.commandName} (${interaction.commandId})`
    )
  }
}

export class OptionNotAutocompletableError extends BotError {
  public constructor(option: ApplicationCommandOptionBase) {
    super(
      `Option "${option.name}" (type "${option.type}") doesn't support autocompletion`
    )
  }
}

export class AutocompleteOptionNotFoundError extends BotError {
  public constructor(
    interaction: AutocompleteInteraction,
    option: AutocompleteFocusedOption
  ) {
    super(
      `Command "${interaction.commandName}" doesn't have the "${option.name}" option`
    )
  }
}

export class NoAutocompleteHandlerError extends BotError {
  public constructor(interaction: AutocompleteInteraction) {
    super(`Command "${interaction.commandName}" has no autocomplete handler.`)
  }
}

export class NoMessageComponentHandlerError extends BotError {
  public constructor(command: Command<ApplicationCommandType>) {
    super(
      `Command "${command.builder.name}" doesn't support message component interactions.`
    )
  }
}

export class NoPermissionError extends BotError {
  public constructor() {
    super("You don't have permission to use this command.")
  }
}

export class GuildOnlyError extends BotError {
  public constructor() {
    super("This command can only be used in a server.")
  }
}

export class InvalidPenaltyError extends BotError {
  public constructor(penalty: string) {
    super(`Invalid penalty "${penalty}".`)
  }
}

export class NoContentTypeError extends BotError {
  public constructor(attachment: Attachment) {
    super(`The file "${attachment.name}" has an invalid filetype.`)
  }
}

export class ImageOnlyError extends BotError {
  public constructor(attachment: Attachment) {
    super(`The file "${attachment.name}" is not an image.`)
  }
}

export class InvalidCustomIdError extends BotError {
  public constructor(customId: string) {
    super(`Invalid custom ID "${customId}".`)
  }
}

export class ChannelNotFoundError extends BotError {
  public constructor(channelId: string) {
    super(`Channel with ID "${channelId}" couldn't be found.`)
  }
}

export class InvalidChannelTypeError extends BotError {
  public constructor(channel: Channel, expected?: ChannelType | ChannelType[]) {
    let channelString
    if ("name" in channel && channel.name) {
      channelString = `Channel "${channel.name}" (ID: "${channel.id}")`
    } else {
      channelString = `"${channel.id}"`
    }

    if (expected === undefined) {
      super(`${channelString} is of an unexpected type`)
      return
    }

    let expectedString
    if (typeof expected === "number") {
      expectedString = expected
    } else {
      expectedString = expected.join(" or ")
    }

    super(`${channelString} is not of type ${expectedString}.`)
  }
}

export class OwnerOnlyError extends BotError {
  public constructor() {
    super("This command can only be used by the bot owner.")
  }
}

export class AuditLogNotFoundError extends BotError {
  public constructor(message: string) {
    super(message)
  }
}

export class InvalidAuditLogEntryError extends BotError {
  public constructor(message: string) {
    super(message)
  }
}

export class NoValidCodeError extends BotError {
  public constructor(message: string) {
    super(message)
  }
}

export class ButtonNotFoundError extends BotError {
  public constructor(name: string) {
    super(`Couldn't find a button with name "${name}"`)
  }
}

export class ModalNotFoundError extends BotError {
  public constructor(name: string) {
    super(`Couldn't find a modal with name "${name}"`)
  }
}

export class DuplicateNameError extends BotError {
  public constructor(name: string) {
    super(`A component with the name ${name} already exists`)
  }
}

export class InvalidComponentTypeError extends BotError {
  public constructor(
    name: string,
    expected: ComponentType,
    got: ComponentType
  ) {
    super(
      `Expected component of type "${expected}" for "${name}", got "${got}" instead`
    )
  }
}

export class UnregisteredNameError extends BotError {
  public constructor(type: "button" | "modal", name: string) {
    super(`A ${type} with the name ${name} doesn't exist`)
  }
}

export class InvalidPathError extends BotError {
  public constructor(value: string) {
    super(`The supplied path ${value} is invalid`)
  }
}

export class InvalidMethodError extends BotError {
  public constructor(value: string) {
    super(`The supplied method ${value} is invalid`)
  }
}

export class NoDataError extends BotError {
  public constructor(message: string) {
    super(message)
  }
}

export class InvalidRoleError extends BotError {
  public constructor(id: Snowflake) {
    super(`The role ${id} is invalid`)
  }
}

export class InvalidEmbedError extends CustomError {
  public constructor(message: string) {
    super(message)
  }
}

export class NoMessageRevisionsError extends CustomError {
  public constructor(id: Snowflake) {
    super(`Message with ID "${id}" has no revisions`)
  }
}
export class InvalidStreamError extends CustomError {
  public constructor() {
    super("The stream isn't an instance of Readable")
  }
}

export class InvalidDateTimeError extends CustomError {
  public constructor(date: DateTime) {
    super(`The date ${JSON.stringify(date.toObject())} is invalid`)
  }
}

export async function logError(client: Client<true>, error: Error) {
  console.error(error)

  const channel = await client.channels.fetch(Config.channels.error, {
    allowUnknownGuild: true,
  })
  if (!channel?.isTextBased()) {
    console.error("Incorrect error channel")
    return
  }

  await channel.send(makeErrorMessage(error, true))
}
