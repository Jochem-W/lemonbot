import { type MessageComponentInteraction } from "discord.js"

export const Interactable = new Map<
  string,
  (interaction: MessageComponentInteraction) => Promise<void>
>()
