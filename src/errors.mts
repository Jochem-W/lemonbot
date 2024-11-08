import { Config } from "./models/config.mjs"
import { makeErrorMessage } from "./utilities/embedUtilities.mjs"
import {
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
import { MIMEType } from "util"

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
  public constructor(current: number, max: number) {
    super(
      `The file size ${current} exceeds the maximum file size of ${max} bytes`,
    )
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

export class CommandNotFoundError extends CustomError {
  public constructor(id: Snowflake) {
    super(`Couldn't find a command with ID ${id}`)
  }
}

export class CommandTypeMismatchError extends CustomError {
  public constructor(
    id: Snowflake,
    expected: ApplicationCommandType,
    got: ApplicationCommandType,
  ) {
    super(`${id} expected a command of type ${expected}, got ${got} instead`)
  }
}

export class InvalidCustomIdError extends CustomError {
  public constructor(customId: string) {
    super(`The custom ID ${customId} is invalid`)
  }
}

export class ComponentNotFoundError extends CustomError {
  public constructor(name: string) {
    super(`Couldn't find a component with name ${name}`)
  }
}

export class ComponentTypeMismatchError extends CustomError {
  public constructor(
    name: string,
    expected: ComponentType,
    got: ComponentType,
  ) {
    super(
      `${name} expected a component of type ${expected}, got ${got} instead`,
    )
  }
}

export class ModalNotFoundError extends CustomError {
  public constructor(name: string) {
    super(`Couldn't find a modal with name ${name}`)
  }
}

export class SubcommandGroupNotFoundError extends CustomError {
  public constructor(
    interaction: CommandInteraction | AutocompleteInteraction,
    subcommandGroup: string,
  ) {
    super(
      `Couldn't find subcommand group ${subcommandGroup} for command ${interaction.commandName} (${interaction.commandId})`,
    )
  }
}

export class SubcommandNotFoundError extends CustomError {
  public constructor(
    interaction: CommandInteraction | AutocompleteInteraction,
    subcommand: string,
  ) {
    super(
      `Couldn't find subcommand ${subcommand} for command ${interaction.commandName} (${interaction.commandId})`,
    )
  }
}

export class OptionNotAutocompletableError extends CustomError {
  public constructor(option: ApplicationCommandOptionBase) {
    super(
      `Option ${option.name} of type ${option.type} doesn't support autocompletion`,
    )
  }
}

export class AutocompleteOptionNotFoundError extends CustomError {
  public constructor(
    interaction: AutocompleteInteraction,
    option: AutocompleteFocusedOption,
  ) {
    super(
      `Command ${interaction.commandName} doesn't have the ${option.name} option`,
    )
  }
}

export class NoAutocompleteHandlerError extends CustomError {
  public constructor(interaction: AutocompleteInteraction) {
    super(`Command ${interaction.commandName} has no autocomplete handler.`)
  }
}

export class GuildOnlyError extends CustomError {
  public constructor() {
    super("This command can only be used in a server.")
  }
}

export class ChannelNotFoundError extends CustomError {
  public constructor(channelId: string) {
    super(`Channel with ID ${channelId} couldn't be found.`)
  }
}

export class InvalidChannelTypeError extends CustomError {
  public constructor(channel: Channel, expected?: ChannelType | ChannelType[]) {
    let channelString
    if ("name" in channel && channel.name) {
      channelString = `Channel ${channel.name} (ID: ${channel.id})`
    } else {
      channelString = `Channel ${channel.id}`
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

export class OwnerOnlyError extends CustomError {
  public constructor() {
    super("This command can only be used by the bot owner.")
  }
}

export class DuplicateNameError extends CustomError {
  public constructor(name: string) {
    super(`A component with the name ${name} already exists`)
  }
}

export class NoDataError extends CustomError {
  public constructor(message: string) {
    super(message)
  }
}

export class InvalidRoleError extends CustomError {
  public constructor(id: Snowflake) {
    super(`The role ${id} is invalid`)
  }
}

export class InvalidEmbedError extends CustomError {
  public constructor(message: string) {
    super(message)
  }
}

export async function logError(client: Client, error: Error) {
  console.error(error)
  if (!client.isReady()) {
    return
  }

  const channel = await client.channels.fetch(Config.channels.error)
  if (!channel?.isSendable()) {
    console.error("Incorrect error channel")
    return
  }

  await channel.send(makeErrorMessage(error, true))
}
