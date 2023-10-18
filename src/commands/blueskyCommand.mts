import { Drizzle } from "../clients.mjs"
import { Colours } from "../colours.mjs"
import { Config } from "../models/config.mjs"
import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import { bluesky } from "../schema.mjs"
import { fetchChannel } from "../utilities/discordUtilities.mjs"
import {
  ChannelType,
  EmbedBuilder,
  SlashCommandStringOption,
  inlineCode,
  range,
} from "discord.js"

export const BlueskyCommand = slashCommand({
  name: "bluesky",
  description: "Donate a Bluesky code to us",
  defaultMemberPermissions: null,
  dmPermission: true,
  options: [
    slashOption(
      true,
      new SlashCommandStringOption()
        .setName("code")
        .setDescription("A Bluesky code"),
    ),
    ...[...range({ start: 2, end: 26 })].map((i) =>
      slashOption(
        false,
        new SlashCommandStringOption()
          .setName(`code${i}`)
          .setDescription("A Bluesky code"),
      ),
    ),
  ],
  async handle(interaction, ...codes: (string | null)[]) {
    const channel = await fetchChannel(
      interaction.client,
      Config.channels.bluesky,
      ChannelType.GuildText,
    )

    const valid = []
    const invalid = []
    for (const code of codes) {
      if (!code) {
        continue
      }

      if (code.match(/^bsky-social-[a-z0-9]{5}-[a-z0-9]{5}$/)) {
        valid.push(code)
        continue
      }

      invalid.push(code)
    }

    const validNoun = `code${valid.length === 1 ? "" : "s"}`

    let options
    if (valid.length === 0) {
      options = {
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`Invalid Bluesky codes`)
            .setDescription(
              `The following Bluesky codes are invalid:\n${invalid
                .map((code) => `- ${inlineCode(code)}`)
                .join("\n")}`,
            )
            .setColor(Colours.red[500]),
        ],
      }
    } else if (invalid.length === 0) {
      options = {
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`Submitted ${valid.length} Bluesky ${validNoun}`)
            .setDescription(
              valid.map((code) => `- ${inlineCode(code)}`).join("\n"),
            )
            .setColor(Colours.green[500]),
        ],
      }
    } else {
      options = {
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`Submitted ${valid.length} Bluesky ${validNoun}`)
            .setFields(
              {
                name: "Valid",
                value: valid.map((code) => `- ${inlineCode(code)}`).join("\n"),
              },
              {
                name: "Invalid",
                value: invalid
                  .map((code) => `- ${inlineCode(code)}`)
                  .join("\n"),
              },
            )
            .setColor(Colours.amber[500]),
        ],
      }
    }

    await interaction.reply(options)

    for (const code of valid) {
      try {
        await Drizzle.insert(bluesky).values({
          code,
          userId: interaction.user.id,
        })
      } catch (e) {
        // TODO
        console.error(e)
        continue
      }

      await channel.send(code)
    }
  },
})
