import {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionAllowedChannelTypes,
  ApplicationCommandOptionBase,
  ApplicationCommandOptionChoiceData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Attachment,
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  Channel,
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
  InteractionContextType,
  LocaleString,
  Permissions,
  Role,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandRoleOption,
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
  User,
} from "discord.js"

type LocalizationMap<Type extends string> = Partial<Record<LocaleString, Type>>

type SlashOptionSharedData<
  Type extends SlashOptionTypeSimple,
  Required extends boolean,
> = {
  name: Lowercase<string>
  nameLocalizations?: LocalizationMap<Lowercase<string>>
  description: string
  descriptionLocalizations?: LocalizationMap<string>
  type: Type
  required: Required
  minLength?: never
  maxLength?: never
  minValue?: never
  maxValue?: never
  choices?: never
  autocomplete?: never
  channelTypes?: never
}

type SlashOptionAutocompleteHandler<
  Type extends Extract<SlashOptionTypeSimple, "string" | "number" | "integer">,
> = (
  interaction: AutocompleteInteraction,
  value: (AutocompleteFocusedOption & { type: SlashOptionType<Type> })["value"],
) =>
  | ApplicationCommandOptionChoiceData<SlashOptionValueType<Type>>[]
  | Promise<ApplicationCommandOptionChoiceData<SlashOptionValueType<Type>>[]>

type SlashOptionData<
  Type extends SlashOptionTypeSimple,
  Required extends boolean,
> =
  | (Omit<
      SlashOptionSharedData<"string", Required>,
      "minLength" | "maxLength" | "autocomplete"
    > & {
      minLength?: number
      maxLength?: number
      autocomplete?: SlashOptionAutocompleteHandler<"string">
    })
  | (Omit<
      SlashOptionSharedData<"string", Required>,
      "minLength" | "maxLength" | "choices"
    > & {
      minLength?: number
      maxLength?: number
      choices: APIApplicationCommandOptionChoice<string>[]
    })
  | (Omit<
      SlashOptionSharedData<"number" | "integer", Required>,
      "minValue" | "maxValue" | "autocomplete"
    > & {
      minValue?: number
      maxValue?: number
      autocomplete?: SlashOptionAutocompleteHandler<"number" | "integer">
    })
  | (Omit<
      SlashOptionSharedData<"number" | "integer", Required>,
      "minValue" | "maxValue" | "choices"
    > & {
      minValue?: number
      maxValue?: number
      choices: APIApplicationCommandOptionChoice<number>[]
    })
  | (Omit<SlashOptionSharedData<"channel", Required>, "channelTypes"> & {
      channelTypes?: ApplicationCommandOptionAllowedChannelTypes[]
    })
  | SlashOptionSharedData<
      Exclude<Type, "string" | "number" | "integer" | "channel">,
      Required
    >

type SlashOptionTypeSimple =
  | "string"
  | "integer"
  | "boolean"
  | "user"
  | "channel"
  | "role"
  | "mentionable"
  | "number"
  | "attachment"

type SlashOptionType<Type extends SlashOptionTypeSimple> = Type extends "string"
  ? ApplicationCommandOptionType.String
  : Type extends SlashCommandIntegerOption
    ? ApplicationCommandOptionType.Integer
    : Type extends SlashCommandBooleanOption
      ? ApplicationCommandOptionType.Boolean
      : Type extends SlashCommandUserOption
        ? ApplicationCommandOptionType.User
        : Type extends SlashCommandChannelOption
          ? ApplicationCommandOptionType.Channel
          : Type extends SlashCommandRoleOption
            ? ApplicationCommandOptionType.Role
            : Type extends SlashCommandMentionableOption
              ? ApplicationCommandOptionType.Mentionable
              : Type extends SlashCommandNumberOption
                ? ApplicationCommandOptionType.Number
                : Type extends SlashCommandAttachmentOption
                  ? ApplicationCommandOptionType.Attachment
                  : never

type SlashOptionValueType<Type extends SlashOptionTypeSimple> =
  Type extends "string"
    ? string
    : Type extends "integer"
      ? number
      : Type extends "boolean"
        ? boolean
        : Type extends "user"
          ? User
          : Type extends "channel"
            ? Channel
            : Type extends "role"
              ? Role
              : Type extends "mentionable"
                ? Exclude<
                    ReturnType<
                      CommandInteractionOptionResolver["getMentionable"]
                    >,
                    null
                  >
                : Type extends "number"
                  ? number
                  : Type extends "attachment"
                    ? Attachment
                    : never

type SlashOptionValueTypeWithRequired<
  Type extends SlashOptionTypeSimple,
  Required extends boolean,
> = Required extends true
  ? SlashOptionValueType<Type>
  : SlashOptionValueType<Type> | null

type InferSlashOptionValueTypes<
  T extends readonly unknown[],
  R extends readonly unknown[] = readonly [],
> = T extends readonly [infer TH, ...infer TT]
  ? InferSlashOptionValueTypes<
      TT,
      TH extends SlashOptionData<SlashOptionTypeSimple, boolean>
        ? readonly [
            ...R,
            SlashOptionValueTypeWithRequired<TH["type"], TH["required"]>,
          ]
        : R
    >
  : R

type SlashCommandSharedData = {
  name: Lowercase<string>
  nameLocalizations?: LocalizationMap<Lowercase<string>>
  description: string
  descriptionLocalizations?: LocalizationMap<string>
}

type SlashSubcommandData<
  Options extends SlashOptionData<SlashOptionTypeSimple, boolean>[],
> = SlashCommandSharedData & {
  options?: [...Options]
  subcommandGroups?: never
  subcommands?: never
  handle: (
    interaction: ChatInputCommandInteraction,
    ...options: [...InferSlashOptionValueTypes<Options>]
  ) => Promise<void>
}

type SlashCommandData<
  Options extends SlashOptionData<SlashOptionTypeSimple, boolean>[],
> = SlashCommandSharedData & {
  dmPermission: boolean
  defaultMemberPermissions: Permissions | bigint | number | null
  nsfw: boolean
} & (
    | {
        options?: [...Options]
        subcommandGroups?: never
        subcommands?: never
        handle: (
          interaction: ChatInputCommandInteraction,
          ...options: [...InferSlashOptionValueTypes<Options>]
        ) => Promise<void>
      }
    | {
        options?: never
        subcommandGroups?: (SlashCommandSharedData & {
          subcommandGroups?: never
          subcommands: ReturnType<typeof slashSubcommand>[]
        })[]
        subcommands: ReturnType<typeof slashSubcommand>[]
      }
    | {
        options?: never
        subcommandGroups: (SlashCommandSharedData & {
          subcommandGroups?: never
          subcommands: ReturnType<typeof slashSubcommand>[]
        })[]
        subcommands?: ReturnType<typeof slashSubcommand>[]
      }
  )

function applyShared<Builder extends ApplicationCommandOptionBase>(
  option: SlashOptionData<SlashOptionTypeSimple, boolean>,
  builder: Builder,
) {
  builder
    .setName(option.name)
    .setDescription(option.description)
    .setRequired(option.required)

  if (option.nameLocalizations) {
    builder.setNameLocalizations(option.nameLocalizations)
  }

  if (option.descriptionLocalizations) {
    builder.setDescriptionLocalizations(option.descriptionLocalizations)
  }

  return builder
}

function addOption(
  option: SlashOptionData<SlashOptionTypeSimple, boolean>,
  commandBuilder:
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandBuilder,
) {
  switch (option.type) {
    case "string":
      commandBuilder.addStringOption((builder) => {
        applyShared(option, builder).setAutocomplete(
          option.autocomplete !== undefined,
        )

        if (typeof option.minLength === "number") {
          builder.setMinLength(option.minLength)
        }

        if (typeof option.maxLength === "number") {
          builder.setMaxLength(option.maxLength)
        }

        if (option.choices) {
          builder.setChoices(...option.choices)
        }

        return builder
      })
      break
    case "number":
      commandBuilder.addNumberOption((builder) => {
        applyShared(option, builder).setAutocomplete(
          option.autocomplete !== undefined,
        )

        if (typeof option.minValue === "number") {
          builder.setMinValue(option.minValue)
        }

        if (typeof option.maxValue === "number") {
          builder.setMaxValue(option.maxValue)
        }

        if (option.choices) {
          builder.setChoices(...option.choices)
        }

        return builder
      })
      break
    case "boolean":
      commandBuilder.addBooleanOption((builder) => applyShared(option, builder))
      break
    case "integer":
      commandBuilder.addIntegerOption((builder) => {
        applyShared(option, builder).setAutocomplete(
          option.autocomplete !== undefined,
        )

        if (typeof option.minValue === "number") {
          builder.setMinValue(option.minValue)
        }

        if (typeof option.maxValue === "number") {
          builder.setMaxValue(option.maxValue)
        }

        if (option.choices) {
          builder.setChoices(...option.choices)
        }

        return builder
      })
      break
    case "user":
      commandBuilder.addUserOption((builder) => applyShared(option, builder))
      break
    case "channel":
      commandBuilder.addChannelOption((builder) => {
        applyShared(option, builder)

        if (option.channelTypes) {
          builder.addChannelTypes(...option.channelTypes)
        }
        return builder
      })
      break
    case "role":
      commandBuilder.addRoleOption((builder) => applyShared(option, builder))
      break
    case "mentionable":
      commandBuilder.addMentionableOption((builder) =>
        applyShared(option, builder),
      )
      break
    case "attachment":
      commandBuilder.addAttachmentOption((builder) =>
        applyShared(option, builder),
      )
      break
    default:
      throw new Error(`Invalid option type`)
  }

  return commandBuilder
}

function getOption<
  Type extends SlashOptionTypeSimple,
  Required extends boolean,
>(
  interaction: ChatInputCommandInteraction,
  option: SlashOptionData<Type, Required>,
): SlashOptionValueTypeWithRequired<Type, Required> {
  switch (option.type) {
    case "string":
      return interaction.options.getString(
        option.name,
        option.required,
      ) as SlashOptionValueTypeWithRequired<Type, Required>
    case "number":
      return interaction.options.getNumber(
        option.name,
        option.required,
      ) as SlashOptionValueTypeWithRequired<Type, Required>
    case "boolean":
      return interaction.options.getBoolean(
        option.name,
        option.required,
      ) as SlashOptionValueTypeWithRequired<Type, Required>
    case "integer":
      return interaction.options.getInteger(
        option.name,
        option.required,
      ) as SlashOptionValueTypeWithRequired<Type, Required>
    case "user":
      return interaction.options.getUser(
        option.name,
        option.required,
      ) as SlashOptionValueTypeWithRequired<Type, Required>
    case "channel":
      return interaction.options.getChannel(
        option.name,
        option.required,
      ) as SlashOptionValueTypeWithRequired<Type, Required>
    case "role":
      return interaction.options.getRole(
        option.name,
        option.required,
      ) as SlashOptionValueTypeWithRequired<Type, Required>
    case "mentionable":
      return interaction.options.getMentionable(
        option.name,
        option.required,
      ) as SlashOptionValueTypeWithRequired<Type, Required>
    case "attachment":
      return interaction.options.getAttachment(
        option.name,
        option.required,
      ) as SlashOptionValueTypeWithRequired<Type, Required>
    default:
      throw new Error(`Invalid option type ${option.type}`)
  }
}

export function slashCommand<
  Data extends SlashOptionData<SlashOptionTypeSimple, boolean>[],
>(data: SlashCommandData<Data>) {
  const { name, nameLocalizations, description, descriptionLocalizations } =
    data

  const contexts = [InteractionContextType.Guild]
  if (data.dmPermission) {
    contexts.push(
      InteractionContextType.PrivateChannel,
      InteractionContextType.BotDM,
    )
  }

  const commandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .setContexts(contexts)
    .setDefaultMemberPermissions(data.defaultMemberPermissions)
    .setNSFW(data.nsfw)

  if (nameLocalizations) {
    commandBuilder.setNameLocalizations(nameLocalizations)
  }

  if (descriptionLocalizations) {
    commandBuilder.setDescriptionLocalizations(descriptionLocalizations)
  }

  if ("options" in data) {
    for (const option of data.options) {
      addOption(option, commandBuilder)
    }
  }

  if ("subcommands" in data) {
    for (const subcommandData of data.subcommands) {
      commandBuilder.addSubcommand(subcommandData.builder)
    }
  }

  if ("subcommandGroups" in data) {
    for (const subcommandGroupData of data.subcommandGroups) {
      commandBuilder.addSubcommandGroup((builder) => {
        builder
          .setName(subcommandGroupData.name)
          .setDescription(subcommandGroupData.description)

        if (subcommandGroupData.nameLocalizations) {
          builder.setNameLocalizations(subcommandGroupData.nameLocalizations)
        }

        if (subcommandGroupData.descriptionLocalizations) {
          builder.setDescriptionLocalizations(
            subcommandGroupData.descriptionLocalizations,
          )
        }

        for (const subcommandData of subcommandGroupData.subcommands) {
          builder.addSubcommand(subcommandData.builder)
        }

        return builder
      })
    }
  }

  if ("handle" in data) {
    return {
      type: ApplicationCommandType.ChatInput as const,
      builder: commandBuilder,
      async handle(interaction: ChatInputCommandInteraction) {
        const optionValues = []
        if (data.options) {
          for (const option of data.options) {
            optionValues.push(getOption(interaction, option))
          }
        }

        await data.handle(
          interaction,
          ...(optionValues as unknown as InferSlashOptionValueTypes<Data>),
        )
      },
      async autocomplete(interaction: AutocompleteInteraction) {
        const focused = interaction.options.getFocused(true)
        const option = data.options?.find((o) => o.name === focused.name)
        if (!option || !option.autocomplete) {
          throw new Error(`Option ${option?.name} doesn't have autocomplete`)
        }

        await interaction.respond(
          await option.autocomplete(interaction, focused.value),
        )
      },
    }
  }

  return {
    type: ApplicationCommandType.ChatInput as const,
    builder: commandBuilder,
    async handle(interaction: ChatInputCommandInteraction) {
      const subcommandGroupName = interaction.options.getSubcommandGroup(false)

      let list = data.subcommands
      if (subcommandGroupName) {
        list = data.subcommandGroups?.find(
          (group) => group.name === subcommandGroupName,
        )?.subcommands
      }

      const subcommandName = interaction.options.getSubcommand(true)
      const command = list?.find((sub) => sub.name === subcommandName)
      if (!command) {
        throw new Error(`Invalid subcommand ${subcommandName}`)
      }

      await command.handle(interaction)
    },
    async autocomplete(interaction: AutocompleteInteraction) {
      const subcommandGroupName = interaction.options.getSubcommandGroup(false)

      let list = data.subcommands
      if (subcommandGroupName) {
        list = data.subcommandGroups?.find(
          (group) => group.name === subcommandGroupName,
        )?.subcommands
      }

      const subcommandName = interaction.options.getSubcommand(true)
      const command = list?.find((sub) => sub.name === subcommandName)
      if (!command) {
        throw new Error(`Invalid subcommand ${subcommandName}`)
      }

      await command.autocomplete(interaction)
    },
  }
}

export function slashSubcommand<
  Data extends SlashOptionData<SlashOptionTypeSimple, boolean>[],
>({
  name,
  nameLocalizations,
  description,
  descriptionLocalizations,
  options,
  handle,
}: SlashSubcommandData<Data>) {
  const builder = new SlashCommandSubcommandBuilder()
    .setName(name)
    .setDescription(description)

  if (nameLocalizations) {
    builder.setNameLocalizations(nameLocalizations)
  }

  if (descriptionLocalizations) {
    builder.setDescriptionLocalizations(descriptionLocalizations)
  }

  if (options) {
    for (const option of options) {
      addOption(option, builder)
    }
  }

  return {
    name,
    builder,
    async handle(interaction: ChatInputCommandInteraction) {
      const optionValues = []
      if (options) {
        for (const option of options) {
          optionValues.push(getOption(interaction, option))
        }
      }

      await handle(
        interaction,
        ...(optionValues as unknown as InferSlashOptionValueTypes<Data>),
      )
    },
    async autocomplete(interaction: AutocompleteInteraction) {
      const focused = interaction.options.getFocused(true)
      const option = options?.find((o) => o.name === focused.name)
      if (!option || !option.autocomplete) {
        throw new Error(`Option ${option?.name} doesn't have autocomplete`)
      }

      await interaction.respond(
        await option.autocomplete(interaction, focused.value),
      )
    },
  }
}
