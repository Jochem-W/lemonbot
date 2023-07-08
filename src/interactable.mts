import { Colours } from "./colours.mjs"
import { staticComponent } from "./models/component.mjs"
import { Config } from "./models/config.mjs"
import {
  interactionGuild,
  interactionMember,
} from "./utilities/interactionUtilities.mjs"
import {
  ComponentType,
  EmbedBuilder,
  type MessageComponentInteraction,
} from "discord.js"

export const Interactable = new Map<
  string,
  (interaction: MessageComponentInteraction) => Promise<void>
>()

staticComponent({
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
