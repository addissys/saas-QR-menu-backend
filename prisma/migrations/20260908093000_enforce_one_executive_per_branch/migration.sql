CREATE UNIQUE INDEX "executive_branches_branch_id_unique"
  ON "executive_branches"("branch_id")
  WHERE "deleted_at" IS NULL;