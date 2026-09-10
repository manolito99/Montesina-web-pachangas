-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "starts_at" TIMESTAMP(3),
ADD COLUMN     "scheduled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tournament_rounds" ADD COLUMN     "starts_at" TIMESTAMP(3),
ADD COLUMN     "ends_at" TIMESTAMP(3),
ADD COLUMN     "court_names" TEXT[];
