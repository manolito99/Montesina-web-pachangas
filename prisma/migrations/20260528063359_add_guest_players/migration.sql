-- DropForeignKey
ALTER TABLE "tournament_players" DROP CONSTRAINT "tournament_players_user_id_fkey";

-- DropIndex
DROP INDEX "tournament_players_tournament_id_user_id_key";

-- AlterTable
ALTER TABLE "tournament_players" ADD COLUMN     "guest_level" INTEGER,
ADD COLUMN     "guest_name" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tournament_players" ADD CONSTRAINT "tournament_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
