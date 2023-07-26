import { Colours } from "../colours.mjs"
import { InvalidRoleError } from "../errors.mjs"
import { Config } from "../models/config.mjs"
import { handler } from "../models/handler.mjs"
import { fetchChannel, tryFetchMember } from "../utilities/discordUtilities.mjs"
import {
  ChannelType,
  EmbedBuilder,
  Guild,
  Message,
  Role,
  roleMention,
  userMention,
} from "discord.js"
import { Duration } from "luxon"

export async function giveMediaRole(
  guild: Guild,
  role: Role,
  message: Message<true>,
  userId: string,
) {
  if (message.author.id !== message.client.user.id) {
    console.warn("Skipping edit of", message.id)
    return
  }

  const user = await guild.client.users.fetch(userId)

  const member = await tryFetchMember(guild, userId)
  if (!member) {
    await message.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle("The member has left the server")
          .setThumbnail(user.displayAvatarURL({ size: 4096 }))
          .setDescription(
            `${userMention(
              userId,
            )} left the server before receiving the ${roleMention(
              role.id,
            )} role.`,
          )
          .setFooter({ text: userId })
          .setTimestamp(Date.now())
          .setColor(Colours.red[500]),
      ],
    })
    return
  }

  if (!member.roles.cache.has(Config.roles.media)) {
    await member.roles.add(Config.roles.media)
  }

  await message.edit({
    embeds: [
      new EmbedBuilder()
        .setTitle(`The member has been given the ${role.name} role`)
        .setThumbnail(member.displayAvatarURL({ size: 4096 }))
        .setDescription(
          `${userMention(
            member.id,
          )} can now send and embed media and links in certain channels.`,
        )
        .setFooter({ text: member.id })
        .setTimestamp(Date.now())
        .setColor(Colours.green[500]),
    ],
  })
}

export const MediaRoleHandler = handler({
  event: "guildMemberUpdate",
  once: false,
  async handle(oldMember, newMember) {
    const role = await newMember.guild.roles.fetch(Config.roles.media)
    if (!role) {
      throw new InvalidRoleError(Config.roles.media)
    }

    if (!(oldMember.pending && !newMember.pending)) {
      return
    }

    const channel = await fetchChannel(
      newMember.client,
      Config.logs.verify,
      ChannelType.GuildText,
    )

    const message = await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("New member verified")
          .setThumbnail(newMember.displayAvatarURL({ size: 4096 }))
          .setDescription(
            `${userMention(newMember.id)} will be given the ${roleMention(
              role.id,
            )} role in 24 hours.`,
          )
          .setFooter({ text: newMember.id })
          .setTimestamp(Date.now()),
      ],
    })

    console.log("Set media role timeout for", 24, "hours for", newMember.id)
    setTimeout(
      () => {
        giveMediaRole(newMember.guild, role, message, newMember.id).catch((e) =>
          console.error(e),
        )
      },
      Duration.fromObject({ days: 1 }).toMillis(),
    )
  },
})
