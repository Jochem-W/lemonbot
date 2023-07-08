import { DuplicateNameError, InvalidComponentTypeError } from "../errors.mjs"
import { Interactable } from "../interactable.mjs"
import {
  ComponentType,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
  RoleSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  ButtonInteraction,
} from "discord.js"

type Interaction<T extends ComponentType> = T extends ComponentType.Button
  ? ButtonInteraction
  : T extends ComponentType.StringSelect
  ? StringSelectMenuInteraction
  : T extends ComponentType.UserSelect
  ? UserSelectMenuInteraction
  : T extends ComponentType.RoleSelect
  ? RoleSelectMenuInteraction
  : T extends ComponentType.MentionableSelect
  ? MentionableSelectMenuInteraction
  : T extends ComponentType.ChannelSelect
  ? ChannelSelectMenuInteraction
  : never

export function staticComponent<T extends ComponentType, TT extends string>({
  type,
  name,
  handle,
}: {
  type: T
  name: TT
  handle: (interaction: Interaction<T>) => Promise<void>
}) {
  if (Interactable.has(name)) {
    throw new DuplicateNameError(name)
  }

  Interactable.set(name, async (interaction) => {
    if (interaction.componentType !== type) {
      throw new InvalidComponentTypeError(name, type, interaction.componentType)
    }

    await handle(interaction as Interaction<T>)
  })

  return name
}

export function component<
  T extends readonly string[],
  TT extends ComponentType
>({
  type,
  name,
  handle,
}: {
  type: TT
  name: string
  handle: (interaction: Interaction<TT>, ...args: T) => Promise<void>
}) {
  if (Interactable.has(name)) {
    throw new DuplicateNameError(name)
  }

  Interactable.set(name, async (interaction) => {
    if (interaction.componentType !== type) {
      throw new InvalidComponentTypeError(name, type, interaction.componentType)
    }

    await handle(
      interaction as Interaction<TT>,
      ...(interaction.customId.split(":").slice(1) as [...T])
    )
  })

  function generateCustomId(...args: T) {
    return `${name}:${args.join(":")}`
  }

  return generateCustomId
}
