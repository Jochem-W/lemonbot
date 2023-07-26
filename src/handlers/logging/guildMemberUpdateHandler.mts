import { Colours } from "../../colours.mjs"
import { Config } from "../../models/config.mjs"
import { handler } from "../../models/handler.mjs"
import {
  fetchChannel,
  memberDisplayName,
} from "../../utilities/discordUtilities.mjs"
import {
  ChannelType,
  EmbedBuilder,
  TextChannel,
  TimestampStyles,
  hyperlink,
  roleMention,
  time,
  userMention,
} from "discord.js"

let logChannel: TextChannel | undefined

export const GuildMemberUpdateHandler = handler({
  event: "guildMemberUpdate",
  once: false,
  async handle(oldMember, newMember) {
    logChannel ??= await fetchChannel(
      newMember.client,
      Config.logs.member,
      ChannelType.GuildText,
    )

    const embeds = [
      new EmbedBuilder()
        .setAuthor({
          name: memberDisplayName(newMember),
          iconURL: newMember.displayAvatarURL(),
        })
        .setTitle("✏️ Member updated")
        .setDescription(userMention(newMember.id))
        .setFooter({ text: newMember.id })
        .setTimestamp(Date.now())
        .setColor(Colours.amber[500]),
    ]

    if (oldMember.roles.cache.difference(newMember.roles.cache).size > 0) {
      const removed = oldMember.roles.cache.subtract(newMember.roles.cache)
      const added = newMember.roles.cache.subtract(oldMember.roles.cache)
      if (removed.size === 0) {
        embeds.push(
          new EmbedBuilder()
            .setColor(Colours.green[500])
            .setTitle("Roles changed")
            .setFields({
              name: "➕ Added",
              value: added.map((r) => roleMention(r.id)).join(" ") || "\u200b",
              inline: true,
            })
            .setDescription(
              added.map((r) => roleMention(r.id)).join(" ") || null,
            ),
        )
      } else if (added.size === 0) {
        embeds.push(
          new EmbedBuilder()
            .setColor(Colours.red[500])
            .setTitle("Roles changed")
            .setFields({
              name: "➖ Removed",
              value:
                removed.map((r) => roleMention(r.id)).join(" ") || "\u200b",
              inline: true,
            })
            .setDescription(
              removed.map((r) => roleMention(r.id)).join(" ") || null,
            ),
        )
      } else {
        embeds.push(
          new EmbedBuilder()
            .setColor(Colours.amber[500])
            .setTitle("Roles changed")
            .setFields(
              {
                name: "➖ Removed",
                value:
                  removed.map((r) => roleMention(r.id)).join(" ") || "\u200b",
                inline: true,
              },
              {
                name: "➕ Added",
                value:
                  added.map((r) => roleMention(r.id)).join(" ") || "\u200b",
                inline: true,
              },
            ),
        )
      }
    }

    if (oldMember.nickname !== newMember.nickname) {
      embeds.push(
        new EmbedBuilder()
          .setColor(Colours.amber[500])
          .setTitle("🏷️ Nickname changed")
          .setFields(
            {
              name: "Before",
              value: oldMember.nickname ?? "\u200b",
              inline: true,
            },
            {
              name: "After",
              value: newMember.nickname ?? "\u200b",
              inline: true,
            },
          ),
      )
    }

    if (oldMember.avatar !== newMember.avatar) {
      const oldAvatar = oldMember.avatarURL()
      const newAvatar = newMember.avatarURL()

      embeds.push(
        new EmbedBuilder()
          .setColor(Colours.amber[500])
          .setTitle("🖼️ Server avatar changed")
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
          .setThumbnail(newAvatar),
      )
    }

    if (
      oldMember.communicationDisabledUntilTimestamp !==
        newMember.communicationDisabledUntilTimestamp &&
      newMember.communicationDisabledUntil
    ) {
      embeds.push(
        new EmbedBuilder()
          .setColor(Colours.amber[500])
          .setTitle("⏱️ Timed out")
          .setFields({
            name: "Until",
            value: time(
              newMember.communicationDisabledUntil,
              TimestampStyles.ShortDateTime,
            ),
          }),
      )
    }

    const [main, change] = embeds
    if (!change || !main) {
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
