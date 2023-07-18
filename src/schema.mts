import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
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
})

export const selectCharacterSchema = createSelectSchema(character)
