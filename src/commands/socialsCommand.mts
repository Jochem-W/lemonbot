import { slashCommand } from "../models/slashCommand.mjs"
import { componentEmoji } from "../utilities/discordUtilities.mjs"
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type MessageActionRowComponentBuilder,
} from "discord.js"

export const SocialCommand = slashCommand({
  name: "socials",
  description: "Displays Lemon's socials and Ko-fi link",
  defaultMemberPermissions: null,
  dmPermission: true,
  nsfw: false,
  async handle(interaction) {
    const heartEmoji = interaction.client.emojis.cache.find(
      (e) => e.name === "kuiperHeart",
    )
    const koFiEmoji = interaction.client.emojis.cache.find(
      (e) => e.name === "kofi",
    )
    const twitterEmoji = interaction.client.emojis.cache.find(
      (e) => e.name === "twitter",
    )

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            "Here are my socials and Ko-fi for when you'd like to further support me and my work!",
          )
          .setThumbnail(heartEmoji?.url ?? null),
      ],
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Ko-fi")
            .setEmoji(componentEmoji(koFiEmoji))
            .setURL("https://ko-fi.com/zesty"),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Twitter (main)")
            .setEmoji(componentEmoji(twitterEmoji))
            .setURL("https://twitter.com/ZestyLemonss"),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Twitter (alt)")
            .setEmoji(componentEmoji(twitterEmoji))
            .setURL("https://twitter.com/realcatirl"),
        ),
      ],
    })
  },
})
