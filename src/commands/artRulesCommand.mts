import { Colours } from "../colours.mjs"
import { staticComponent } from "../models/component.mjs"
import { Config } from "../models/config.mjs"
import { slashCommand, slashOption } from "../models/slashCommand.mjs"
import {
  interactionChannel,
  interactionGuild,
  interactionMember,
} from "../utilities/interactionUtilities.mjs"
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
  type MessageActionRowComponentBuilder,
  quote,
  bold,
  channelMention,
  SlashCommandStringOption,
} from "discord.js"

const acceptRules = staticComponent({
  type: ComponentType.Button,
  name: "art-rules",
  async handle(interaction) {
    const guild = await interactionGuild(interaction, true)
    const member = await interactionMember(interaction, { force: true })

    const clientMember = await guild.members.fetch(Config.applicationId)

    if (member.roles.cache.has(Config.roles.art)) {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "You already have access to the art channels",
              iconURL: clientMember.displayAvatarURL(),
            })
            .setColor(Colours.red[500]),
        ],
      })
      return
    }

    await member.roles.add(Config.roles.art)

    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Access to the art channels has been granted!",
            iconURL: clientMember.displayAvatarURL(),
          })
          .setColor(Colours.green[500])
          .setTimestamp(Date.now()),
      ],
    })
  },
})

const rules = {
  embeds: [
    new EmbedBuilder()
      .setTitle("Art category rules")
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/1125446368002052186/1127325150245814362/IMG_4463.png"
      )
      .setDescription(
        `${quote(
          "Please refer to, and read these rules thoroughly to gain the ability to send messages and images in the art channels!"
        )}`
      )
      .setFields(
        {
          name: "1️⃣ › Please post in the correct art channels.",
          value: `${bold("1a ›")} ${channelMention(
            Config.art.general
          )} is for discussing art, sending commission sheets, etc.\n${bold(
            "1b ›"
          )} ${channelMention(Config.art.yours)} and ${channelMention(
            Config.art.wips
          )} is for showcasing your artwork for the server to see!\n${bold(
            "1c ›"
          )} ${channelMention(
            Config.art.others
          )} is for sharing artwork that is not your own.\n`,
        },
        {
          name: "2️⃣ › Suggestive and NSFW artwork and images are prohibited.",
          value: `Images violating this rule will be deleted, and, if this offense is repeated, you will lose access to these channels. ${bold(
            "This is a zero tolerance policy."
          )}`,
        },
        {
          name: "3️⃣ › Do not repost art without credit.",
          value: `${bold(
            "3a ›"
          )} Do not repost art without credit. Artist's works deserve to be properly regonized and appreciated.\n${bold(
            "3b ›"
          )} Do not post artwork in ${channelMention(
            Config.art.others
          )} without properly crediting the original artist.\n${bold(
            "3c ›"
          )} If you do not know the original artist, take the time and effort to find out, or do not post at all.`,
        },
        {
          name: "4️⃣ › Use proper etiquette.",
          value:
            "Please try to not post over other people here. Everyone's work deserves proper recognition and it can be hurtful to do this! We would also appreciate it if you did not use the art channels to only self promote yourself; this is a community, not an advertisement station!",
        }
      )
      .setFooter({
        text: "If you have THOROUGHLY read through these rules, you can press the button below to gain access to the art channels!",
      }),
  ],
  components: [
    new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🎨")
        .setLabel("Accept")
        .setCustomId(acceptRules)
    ),
  ],
}

export const ArtRulesCommand = slashCommand({
  name: "artrules",
  description: "Send the art rules",
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  dmPermission: false,
  options: [
    slashOption(
      false,
      new SlashCommandStringOption()
        .setName("message")
        .setDescription("The ID of the message to edit")
    ),
  ],
  async handle(interaction, messageId) {
    rules.embeds[0]?.setTimestamp(interaction.createdAt)

    const channel = await interactionChannel(interaction, true)
    let rulesMessage
    if (messageId) {
      const message = await channel.messages.fetch(messageId)
      rulesMessage = await message.edit(rules)
    } else {
      rulesMessage = await channel.send(rules)
    }

    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder().setTitle(
          `Art rules ${messageId ? "updated" : "sent"}`
        ),
      ],
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setEmoji("🔗")
            .setLabel("Go to message")
            .setURL(rulesMessage.url)
        ),
      ],
    })
  },
})
