import { DownloadError } from "../errors.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import { EmbedBuilder } from "discord.js"
import { z } from "zod"

const url = "https://dog.ceo/api/breeds/image/random"
const responseModel = z.object({
  message: z.string().url(),
  status: z.literal("success"),
})

export const DogCommand = slashCommand({
  name: "dog",
  description: "Sends a random dog image 🐶",
  defaultMemberPermissions: null,
  dmPermission: true,
  nsfw: false,
  async handle(interaction) {
    await interaction.deferReply()

    const response = await fetch(url)
    if (!response.ok) {
      throw new DownloadError(url)
    }

    const json = await responseModel.parseAsync(await response.json())

    await interaction.editReply({
      embeds: [new EmbedBuilder().setTitle("🐶 Woof!").setImage(json.message)],
    })
  },
})
