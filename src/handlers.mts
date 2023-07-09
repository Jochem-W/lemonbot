import { ArtboardMessageCreateHandler } from "./handlers/artboardMessageCreateHandler.mjs"
import { ArtboardMessageUpdateHandler } from "./handlers/artboardMessageUpdateHandler.mjs"
import { ArtboardReactionHandler } from "./handlers/artboardReactionHandler.mjs"
import { BanNewAccountsHandler } from "./handlers/banNewAccountsHandler.mjs"
import { CrosspostHandler } from "./handlers/crosspostHandler.mjs"
import { DebugHandler } from "./handlers/debugHandler.mjs"
import { InteractionHandler } from "./handlers/interactionHandler.mjs"
import { LemonMentionHandler } from "./handlers/lemonMentionHandler.mjs"
import { GuildBanAddHandler } from "./handlers/logging/guildBanAddHandler.mjs"
import { GuildBanRemoveHandler } from "./handlers/logging/guildBanRemoveHandler.mjs"
import { GuildMemberAddHandler } from "./handlers/logging/guildMemberAddHandler.mjs"
import { GuildMemberRemoveHandler } from "./handlers/logging/guildMemberRemoveHandler.mjs"
import { GuildMemberUpdateHandler } from "./handlers/logging/guildMemberUpdateHandler.mjs"
import { MessageDeleteBulkHandler } from "./handlers/logging/messageDeleteBulkHandler.mjs"
import { MessageDeleteHandler } from "./handlers/logging/messageDeleteHandler.mjs"
import { MessageUpdateHandler } from "./handlers/logging/messageUpdateHandler.mjs"
import { UserUpdateHandler } from "./handlers/logging/userUpdateHandler.mjs"
import { VoiceLogsHandler } from "./handlers/logging/voiceLogsHandler.mjs"
import { MediaRoleHandler } from "./handlers/mediaRoleHandler.mjs"
import { MediaRoleStartupHandler } from "./handlers/mediaRoleStartupHandler.mjs"
import { QotwHandler } from "./handlers/qotwHandler.mjs"
import { RegisterCommands } from "./handlers/registerCommands.mjs"
import { StartupHandler } from "./handlers/startupHandler.mjs"
import { UnbanOldAccountsHandler } from "./handlers/unbanOldAccountsHandler.mjs"
import { UpdatePresenceOnJoinHandler } from "./handlers/updatePresenceOnJoinHandler.mjs"
import { UpdatePresenceOnLeaveHandler } from "./handlers/updatePresenceOnLeaveHandler.mjs"
import { UpdatePresenceOnStartupHandler } from "./handlers/updatePresenceOnStartupHandler.mjs"
import type { Handler } from "./models/handler.mjs"
import type { ClientEvents } from "discord.js"

export const Handlers: Handler<keyof ClientEvents>[] = [
  ArtboardMessageCreateHandler,
  ArtboardMessageUpdateHandler,
  ArtboardReactionHandler,
  BanNewAccountsHandler,
  CrosspostHandler,
  DebugHandler,
  InteractionHandler,
  LemonMentionHandler,
  MediaRoleHandler,
  MediaRoleStartupHandler,
  QotwHandler,
  RegisterCommands,
  StartupHandler,
  UnbanOldAccountsHandler,
  UpdatePresenceOnJoinHandler,
  UpdatePresenceOnLeaveHandler,
  UpdatePresenceOnStartupHandler,

  GuildBanAddHandler,
  GuildBanRemoveHandler,
  GuildMemberAddHandler,
  GuildMemberRemoveHandler,
  GuildMemberUpdateHandler,
  MessageDeleteBulkHandler,
  MessageDeleteHandler,
  MessageUpdateHandler,
  UserUpdateHandler,
  VoiceLogsHandler,
]
