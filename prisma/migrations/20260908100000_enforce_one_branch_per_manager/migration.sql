CREATE UNIQUE INDEX "branches_manager_id_unique"
  ON "branches"("manager_id")
  WHERE "manager_id" IS NOT NULL AND "deleted_at" IS NULL;