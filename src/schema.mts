import { pgTable, serial, text } from "drizzle-orm/pg-core"

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
