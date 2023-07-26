import { Config } from "../models/config.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import { componentEmoji } from "../utilities/discordUtilities.mjs"
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type MessageActionRowComponentBuilder,
  hyperlink,
  userMention,
  bold,
  italic,
} from "discord.js"

export const CommissionsCommand = slashCommand({
  name: "commissions",
  description: "Display Lemon's commission info",
  defaultMemberPermissions: null,
  dmPermission: true,
  async handle(interaction) {
    const twitterEmoji = interaction.client.emojis.cache.find(
      (e) => e.name === "twitter",
    )
    const koFiEmoji = interaction.client.emojis.cache.find(
      (e) => e.name === "kofi",
    )
    const kuiperEmoji = interaction.client.emojis.cache.find(
      (e) => e.name === "kuiperMoney",
    )

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("ZestyLemonss Commissions")
          .setDescription(
            `Here's my commission sheet! If you're interested in getting one, send a payment through my ${hyperlink(
              bold("Ko-fi"),
              "https://ko-fi.com/zesty",
            )} and a DM letting me know what you'd like!`,
          )
          .setFields({
            name: "📜 Guidelines",
            value: `- Do not contact Lemon directly through DMs or otherwise for questions ${bold(
              "unless commissions are posted as open",
            )}. DMs are not allowed and you will not get a response. If your question is important, contact ${userMention(
              Config.mailUser,
            )}.\n- Commission ideas outside of the scope of art concepts listed in the pricing sheet are not available. SFW, out of the norm commissions are available to ${bold(
              "premium server members",
            )} when Lemon opens commissions.\n- Commissions open periodically every month based on Lemons schedule. ${bold(
              "Premium server members",
            )} who have access to paid channels will have early priority slots. ${hyperlink(
              bold("Subscribe here!"),
              "https://ko-fi.com/zesty/tiers",
            )}\n- If you disagree with pricing, etc. ${italic(
              "I do not care, I am a full time college student who has no access to a job right now. My time is limited, I have motor inhibition which inhibits drawing more than before, and as such my free time being dedicated to these works should be compensated for accordingly.",
            )}`,
          })
          .setImage(
            "https://cdn.discordapp.com/attachments/1125446368002052186/1127297425640525875/zestylemonss_comms_sheet.png",
          )
          .setColor(0xff5353),
      ],
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Subscribe here!")
            .setURL("https://ko-fi.com/zesty/tiers")
            .setEmoji(componentEmoji(kuiperEmoji)),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Ko-fi")
            .setURL("https://ko-fi.com/zesty")
            .setEmoji(componentEmoji(koFiEmoji)),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Twitter")
            .setURL("https://twitter.com/ZestyLemonss")
            .setEmoji(componentEmoji(twitterEmoji)),
        ),
      ],
    })
  },
})
