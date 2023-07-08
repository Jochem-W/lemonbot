CREATE TABLE IF NOT EXISTS "dontShowAgain" (
	"id" serial PRIMARY KEY NOT NULL,
	"lemonId" text NOT NULL,
	"userId" text NOT NULL
);
