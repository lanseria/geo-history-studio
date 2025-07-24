CREATE TABLE "geo_history_studio_app"."placenames" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"traditional_name" text,
	"english_name" text,
	"coordinates" numeric(9, 6)[2] NOT NULL,
	"year_range" integer[2] NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
