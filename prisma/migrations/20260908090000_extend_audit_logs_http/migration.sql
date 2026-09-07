ALTER TABLE "audit_logs" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_user_id_fkey";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD COLUMN "user_role" VARCHAR(255);
ALTER TABLE "audit_logs" ADD COLUMN "branch_id" UUID;
ALTER TABLE "audit_logs" ADD COLUMN "method" VARCHAR(10);
ALTER TABLE "audit_logs" ADD COLUMN "endpoint" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "status_code" INTEGER;
ALTER TABLE "audit_logs" ADD COLUMN "request_body" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN "response_body" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN "success" BOOLEAN;
ALTER TABLE "audit_logs" ADD COLUMN "error_message" TEXT;