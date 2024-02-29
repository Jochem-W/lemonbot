import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"

export const artboard = pgTable("artboard", {
  messageId: text("messageId").primaryKey(),
  channelId: text("channelId").notNull(),
  threadId: text("threadId"),
})

export const dontShowAgain = pgTable("dontShowAgain", {
  id: serial("id").primaryKey(),
  lemonId: text("lemonId").notNull(),
  userId: text("userId").notNull(),
})

export const qotw = pgTable("qotw", {
  id: serial("id").primaryKey(),
  body: text("question").notNull(),
})

export const character = pgTable("character", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pronouns: text("pronouns").notNull(),
  creator: text("creator").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  colour: integer("colour").notNull(),
  icon: text("icon").notNull(),
  palette: text("palette").notNull(),
  image1: text("image1"),
  image2: text("image2"),
  image3: text("image3"),
  message: text("message").notNull(),
})

export const bluesky = pgTable("bluesky", {
  code: text("code").primaryKey(),
  userId: text("userId").notNull(),
})

export const pruneMembers = pgTable(
  "prune_members",
  {
    user: text("user"),
    newest: timestamp("newest").notNull(),
    channel: text("channel"),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.user, table.channel] }),
    }
  },
)

export const pruneProgress = pgTable("prune_progress", {
  channel: text("channel").primaryKey(),
  before: text("before").notNull().unique(),
})

export const selectCharacterSchema = createSelectSchema(character)
