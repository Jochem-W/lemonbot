import { Colours } from "../../colours.mjs"
import { Config } from "../../models/config.mjs"
import { handler } from "../../models/handler.mjs"
import {
  fetchChannel,
  userDisplayName,
} from "../../utilities/discordUtilities.mjs"
import {
  ChannelType,
  EmbedBuilder,
  TextChannel,
  hyperlink,
  userMention,
} from "discord.js"

let logChannel: TextChannel | undefined

export const UserUpdateHandler = handler({
  event: "userUpdate",
  once: false,
  async handle(oldUser, newUser) {
    logChannel ??= await fetchChannel(
      newUser.client,
      Config.logs.user,
      ChannelType.GuildText,
    )

    const embeds = [
      new EmbedBuilder()
        .setAuthor({
          name: userDisplayName(newUser),
          iconURL: newUser.displayAvatarURL({ size: 4096 }),
        })
        .setTitle("✏️ User updated")
        .setDescription(userMention(newUser.id))
        .setFooter({ text: newUser.id })
        .setTimestamp(Date.now())
        .setColor(Colours.amber[500]),
    ]

    if (oldUser.avatar !== newUser.avatar) {
      const oldAvatar = oldUser.avatarURL()
      const newAvatar = newUser.avatarURL()

      embeds.push(
        new EmbedBuilder()
          .setTitle("🖼️ Avatar changed")
          .setThumbnail(newAvatar)
          .setFields(
            {
              name: "Before",
              value: oldAvatar ? hyperlink("Click here", oldAvatar) : "\u200b",
              inline: true,
            },
            {
              name: "After",
              value: newAvatar ? hyperlink("Click here", newAvatar) : "\u200b",
              inline: true,
            },
          )
          .setColor(Colours.amber[500]),
      )
    }

    if (oldUser.discriminator !== newUser.discriminator) {
      embeds.push(
        new EmbedBuilder()
          .setTitle("#️⃣ Discriminator changed")
          .setFields(
            {
              name: "Before",
              value: oldUser.discriminator ?? "\u200b",
              inline: true,
            },
            {
              name: "After",
              value: newUser.discriminator,
              inline: true,
            },
          )
          .setColor(Colours.amber[500]),
      )
    }

    if (oldUser.globalName !== newUser.globalName) {
      embeds.push(
        new EmbedBuilder()
          .setTitle("🏷️ Display name changed")
          .setFields(
            {
              name: "Before",
              value: oldUser.globalName ?? "\u200b",
              inline: true,
            },
            {
              name: "After",
              value: newUser.globalName ?? "\u200b",
              inline: true,
            },
          )
          .setColor(Colours.amber[500]),
      )
    }

    if (oldUser.username !== newUser.username) {
      embeds.push(
        new EmbedBuilder()
          .setTitle("🏷️ Username changed")
          .setFields(
            {
              name: "Before",
              value: oldUser.username ?? "\u200b",
              inline: true,
            },
            {
              name: "After",
              value: newUser.username,
              inline: true,
            },
          )
          .setColor(Colours.amber[500]),
      )
    }

    const [main, change] = embeds
    if (!change || !main) {
      // flags?
      return
    }

    if (embeds.length === 2) {
      main.setTitle(change.data.title ?? null)
      if (change.data.fields) {
        main.setFields(change.data.fields)
      }

      if (change.data.image) {
        main.setImage(change.data.image.url)
      }

      if (change.data.thumbnail) {
        main.setThumbnail(change.data.thumbnail.url)
      }

      if (change.data.color !== undefined) {
        main.setColor(change.data.color)
      }

      embeds.pop()
    }

    await logChannel.send({ embeds })
  },
})
