CREATE TABLE "music_connections" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text,
	"provider_email" text,
	"provider_display_name" text,
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text,
	"token_expires_at" timestamp,
	"scope" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "music_connections_user_provider_unique" UNIQUE("user_id","provider")
);
--> statement-breakpoint
CREATE INDEX "music_connections_user_id_idx" ON "music_connections" ("user_id");--> statement-breakpoint
ALTER TABLE "music_connections" ADD CONSTRAINT "music_connections_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;