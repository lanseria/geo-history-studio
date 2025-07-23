CREATE SCHEMA "geo_history_studio_app";
--> statement-breakpoint
CREATE TYPE "geo_history_studio_app"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "geo_history_studio_app"."users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" "geo_history_studio_app"."user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
