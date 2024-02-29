CREATE TABLE IF NOT EXISTS "prune_members" (
	"user" text,
	"newest" timestamp NOT NULL,
	"channel" text,
	CONSTRAINT "prune_members_user_channel_pk" PRIMARY KEY("user","channel")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prune_progress" (
	"channel" text PRIMARY KEY NOT NULL,
	"before" text NOT NULL,
	CONSTRAINT "prune_progress_before_unique" UNIQUE("before")
);
