-- AlterEnum
ALTER TYPE "TournamentFormat" ADD VALUE 'PERSONALIZADO';

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "free_scoring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "match_duration_min" INTEGER;
