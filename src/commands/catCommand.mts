import { DownloadError } from "../errors.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import { EmbedBuilder } from "discord.js"
import { z } from "zod"

const url = "https://api.thecatapi.com/v1/images/search"
const responseModel = z.tuple([z.object({ url: z.string().url() })])

export const CatCommand = slashCommand({
  name: "cat",
  description: "Sends a random cat image 🐱",
  defaultMemberPermissions: null,
  dmPermission: true,
  nsfw: false,
  async handle(interaction) {
    await interaction.deferReply()

    const response = await fetch(url)
    if (!response.ok) {
      throw new DownloadError(url)
    }

    const [image] = await responseModel.parseAsync(await response.json())

    await interaction.editReply({
      embeds: [new EmbedBuilder().setTitle("🐱 Meow!").setImage(image.url)],
    })
  },
})
