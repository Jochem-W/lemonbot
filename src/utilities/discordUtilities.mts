import {
  ChannelNotFoundError,
  InvalidChannelTypeError,
  OwnerOnlyError,
} from "../errors.mjs"
import { Config } from "../models/config.mjs"
import {
  User,
  type Channel,
  type FetchChannelOptions,
  type PublicThreadChannel,
  type Snowflake,
  GuildEmoji,
  type ComponentEmojiResolvable,
  GuildMember,
  Client,
  ActivityType,
} from "discord.js"
import {
  ChannelType,
  DiscordAPIError,
  RESTJSONErrorCodes,
  Guild,
  Team,
  type FetchMemberOptions,
  type Interaction,
  type UserResolvable,
} from "discord.js"
import { DateTime } from "luxon"

export async function updatePresence(client: Client<true>) {
  const guild = await client.guilds.fetch(Config.guild)
  client.user.setPresence({
    activities: [
      { name: `over ${guild.memberCount} lemons`, type: ActivityType.Watching },
    ],
  })
}

export function uniqueName(user: User) {
  if (user.discriminator !== "0") {
    return `${user.username}#${user.discriminator}`
  }

  return user.username
}

export function userDisplayName(user: User) {
  if (user.globalName) {
    return user.globalName
  }

  return user.username
}

export function memberDisplayName(member: GuildMember) {
  if (member.nickname) {
    return member.nickname
  }

  return userDisplayName(member.user)
}

export function snowflakeToDateTime(snowflake: Snowflake) {
  return DateTime.fromMillis(
    Number((BigInt(snowflake) >> 22n) + 1420070400000n),
    { zone: "utc" },
  )
}

export async function tryFetchMember(
  data: { id: Snowflake; client: Client<true> } | Guild,
  options: FetchMemberOptions | UserResolvable,
) {
  let guild
  if (!(data instanceof Guild)) {
    const { id, client } = data
    guild = await client.guilds.fetch(id)
  } else {
    guild = data
  }

  try {
    return await guild.members.fetch(options)
  } catch (e) {
    if (
      e instanceof DiscordAPIError &&
      e.code === RESTJSONErrorCodes.UnknownMember
    ) {
      return null
    }

    throw e
  }
}

export async function fetchChannel<T extends ChannelType>(
  client: Client<true>,
  id: Snowflake,
  type: T | T[],
  options?: FetchChannelOptions,
) {
  const channel = await client.channels.fetch(id, {
    allowUnknownGuild: true,
    ...options,
  })
  if (!channel) {
    throw new ChannelNotFoundError(id)
  }

  if (
    (typeof type === "number" && channel.type !== type) ||
    (typeof type === "object" && !type.includes(channel.type as T))
  )
    if (channel.type !== type) {
      throw new InvalidChannelTypeError(channel, type)
    }

  return channel as T extends
    | ChannelType.PublicThread
    | ChannelType.AnnouncementThread
    ? PublicThreadChannel
    : Extract<Channel, { type: T }>
}

export async function ensureOwner(interaction: Interaction) {
  let application = interaction.client.application
  if (!application.owner) {
    application = await application.fetch()
  }

  if (!application.owner) {
    throw new OwnerOnlyError()
  }

  if (application.owner instanceof Team) {
    if (!application.owner.members.has(interaction.user.id)) {
      throw new OwnerOnlyError()
    }

    return
  }

  if (application.owner.id !== interaction.user.id) {
    throw new OwnerOnlyError()
  }
}

export function componentEmoji(emoji: GuildEmoji | undefined) {
  const data: ComponentEmojiResolvable = {}

  if (!emoji) {
    return data
  }

  if (emoji.id) {
    data.id = emoji.id
  }

  if (emoji.name) {
    data.name = emoji.name
  }

  if (emoji.animated) {
    data.animated = true
  }

  return data
}

export function truncate(values: string[], max: number) {
  let first = true
  let omitted = 0
  while (values.join(" ").length > max) {
    if (!first) {
      values.pop()
    }

    values.pop()
    omitted += 1
    values.push(`+${omitted}`)
    first = false
  }

  return values.join(" ")
}
