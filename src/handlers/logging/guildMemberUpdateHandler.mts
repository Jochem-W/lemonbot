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
      ChannelType.GuildText
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
        .setColor(Colours.orange[500]),
    ]

    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
      embeds.push(
        new EmbedBuilder()
          .setColor(Colours.orange[500])
          .setTitle("Roles changed")
          .setFields(
            {
              name: "➖ Removed",
              value:
                oldMember.roles.cache
                  .difference(newMember.roles.cache)
                  .map((r) => roleMention(r.id))
                  .join(" ") || "\u200b",
              inline: true,
            },
            {
              name: "➕ Added",
              value:
                newMember.roles.cache
                  .difference(oldMember.roles.cache)
                  .map((r) => roleMention(r.id))
                  .join(" ") || "\u200b",
              inline: true,
            }
          )
      )
    }

    if (oldMember.nickname !== newMember.nickname) {
      embeds.push(
        new EmbedBuilder()
          .setColor(Colours.orange[500])
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
            }
          )
      )
    }

    if (oldMember.avatar !== newMember.avatar) {
      const oldAvatar = oldMember.avatarURL()
      const newAvatar = newMember.avatarURL()

      embeds.push(
        new EmbedBuilder()
          .setColor(Colours.orange[500])
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
            }
          )
          .setThumbnail(newAvatar)
      )
    }

    if (
      oldMember.communicationDisabledUntilTimestamp !==
        newMember.communicationDisabledUntilTimestamp &&
      newMember.communicationDisabledUntil
    ) {
      embeds.push(
        new EmbedBuilder()
          .setColor(Colours.orange[500])
          .setTitle("⏱️ Timed out")
          .setFields({
            name: "Until",
            value: time(
              newMember.communicationDisabledUntil,
              TimestampStyles.ShortDateTime
            ),
          })
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

      embeds.pop()
    }

    await logChannel.send({ embeds })
  },
})
