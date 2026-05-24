-- AlterTable
ALTER TABLE "courts" ADD COLUMN     "address" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "is_club" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT;

-- AddForeignKey
ALTER TABLE "courts" ADD CONSTRAINT "courts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
