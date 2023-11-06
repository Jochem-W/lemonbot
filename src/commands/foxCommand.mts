import { DownloadError } from "../errors.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import { EmbedBuilder } from "discord.js"
import { z } from "zod"

const url = "https://randomfox.ca/floof/"
const responseModel = z.object({ image: z.string().url() })

export const FoxCommand = slashCommand({
  name: "fox",
  description: "Sends a random fox image 🦊",
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
      embeds: [new EmbedBuilder().setTitle("🦊 Yip!").setImage(json.image)],
    })
  },
})
