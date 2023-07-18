CREATE TABLE IF NOT EXISTS "character" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"pronouns" text NOT NULL,
	"creator" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"colour" integer NOT NULL,
	"icon" text NOT NULL,
	"palette" text NOT NULL,
	"image1" text,
	"image2" text,
	"image3" text
);
