import { AddEmojiCommand } from "./commands/addEmojiCommand.mjs"
import { ArtRulesCommand } from "./commands/artRulesCommand.mjs"
import { AvatarCommand } from "./commands/avatarCommand.mjs"
import { AvatarContextCommand } from "./commands/avatarContextCommand.mjs"
import { BannerCommand } from "./commands/bannerCommand.mjs"
import { BannerContextCommand } from "./commands/bannerContextCommand.mjs"
import { BlueskyCommand } from "./commands/blueskyCommand.mjs"
import { CatCommand } from "./commands/catCommand.mjs"
import { CharactersCommand } from "./commands/charactersCommand.mjs"
import { CommissionsCommand } from "./commands/commissionsCommand.mjs"
import { DogCommand } from "./commands/dogCommand.mjs"
import { EditCommand } from "./commands/editCommand.mjs"
import { EightBallCommand } from "./commands/eightBallCommand.mjs"
import { ExemptCommand } from "./commands/exemptCommand.mjs"
import { FlipCommand } from "./commands/flipCommand.mjs"
import { FoxCommand } from "./commands/foxCommand.mjs"
import { InfoCommand } from "./commands/infoCommand.mjs"
import { PaletteCommand } from "./commands/paletteCommand.mjs"
import { PickleCommand } from "./commands/pickleCommand.mjs"
import { PurgeCommand } from "./commands/purgeCommand.mjs"
import { QotwCommand } from "./commands/qotwCommand.mjs"
import { RpsCommand } from "./commands/rpsCommand.mjs"
import { SayCommand } from "./commands/sayCommand.mjs"
import { SlowmodeCommand } from "./commands/slowmodeCommand.mjs"
import { SocialCommand } from "./commands/socialsCommand.mjs"
import { ToggleInvitesCommand } from "./commands/toggleInvitesCommand.mjs"
import { UnbanCommand } from "./commands/unbanCommand.mjs"
import { UserInfoContextCommand } from "./commands/userInfoContextCommand.mjs"
import type { Command } from "./types/command.mjs"
import { ApplicationCommandType, Collection, type Snowflake } from "discord.js"

export const SlashCommands: Command<ApplicationCommandType.ChatInput>[] = [
  AddEmojiCommand,
  ArtRulesCommand,
  AvatarCommand,
  BannerCommand,
  BlueskyCommand,
  CatCommand,
  CharactersCommand,
  CommissionsCommand,
  DogCommand,
  EditCommand,
  EightBallCommand,
  ExemptCommand,
  FlipCommand,
  FoxCommand,
  InfoCommand,
  PaletteCommand,
  PickleCommand,
  PurgeCommand,
  QotwCommand,
  RpsCommand,
  SayCommand,
  SlowmodeCommand,
  SocialCommand,
  ToggleInvitesCommand,
  UnbanCommand,
]

export const MessageContextMenuCommands: Command<ApplicationCommandType.Message>[] =
  []

export const UserContextMenuCommands: Command<ApplicationCommandType.User>[] = [
  AvatarContextCommand,
  BannerContextCommand,
  UserInfoContextCommand,
]

export const RegisteredCommands = new Collection<
  Snowflake,
  Command<ApplicationCommandType>
>()
