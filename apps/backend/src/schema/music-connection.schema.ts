import {
  pgTable,
  text,
  timestamp,
  index,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const musicConnections = pgTable(
  "music_connections",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider", { enum: ["spotify", "apple_music"] }).notNull(),
    providerUserId: text("provider_user_id").notNull(),
    providerDisplayName: text("provider_display_name"),
    accessTokenEncrypted: text("access_token_encrypted").notNull(),
    refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
    tokenExpiresAt: timestamp("token_expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("music_connections_user_id_idx").on(table.userId),
    unique("music_connections_user_provider_unique").on(
      table.userId,
      table.provider,
    ),
  ],
);

export type MusicConnectionEntity = typeof musicConnections.$inferSelect;
export type NewMusicConnectionEntity = typeof musicConnections.$inferInsert;
