CREATE TYPE "public"."policy_status" AS ENUM('pending', 'signed');--> statement-breakpoint
CREATE TABLE "brokers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'broker',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "brokers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"document_url" text,
	"document_public_id" text,
	"status" "policy_status" DEFAULT 'pending' NOT NULL,
	"signing_token" text,
	"broker_id" serial NOT NULL,
	"docusign_envelope_id" text,
	"signed_pdf_url" text,
	"signed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "policies_signing_token_unique" UNIQUE("signing_token")
);
--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_broker_id_brokers_id_fk" FOREIGN KEY ("broker_id") REFERENCES "public"."brokers"("id") ON DELETE cascade ON UPDATE no action;