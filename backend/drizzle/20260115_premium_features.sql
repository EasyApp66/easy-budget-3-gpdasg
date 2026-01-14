-- Create promo codes table
CREATE TABLE "promo_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"duration_days" integer NOT NULL,
	"max_redemptions" integer,
	"current_redemptions" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
-- Create premium subscriptions table with foreign key
CREATE TABLE "premium_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "public"."user"("id") ON DELETE cascade,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"transaction_id" text NOT NULL,
	"amount" text,
	"currency" text,
	"status" text DEFAULT 'active' NOT NULL,
	"purchased_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Create promo code redemptions table with foreign keys
CREATE TABLE "promo_code_redemptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "public"."user"("id") ON DELETE cascade,
	"promo_code_id" text NOT NULL REFERENCES "public"."promo_codes"("id") ON DELETE cascade,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
