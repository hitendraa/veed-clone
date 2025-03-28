import { integer, json, pgTable, varchar, timestamp  } from "drizzle-orm/pg-core";

export const USER_TABLE = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  image: varchar(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().default(10).notNull()
});

export const VIDEO_RAW_TABLE = pgTable("VIDEO_RAW_TABLE", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  videoId: varchar().notNull(),
  videoData: json(),
  type: varchar(),
  createdBy: varchar().notNull().references(() => USER_TABLE.email),
});

export const MEDIA_ASSETS_TABLE = pgTable("media_assets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  url: varchar().notNull(),
  name: varchar().notNull(),
  type: varchar().notNull(), // image/video
  createdBy: varchar().notNull().references(() => USER_TABLE.email),
  createdAt: timestamp().defaultNow(),
  size: integer(), // in bytes
});