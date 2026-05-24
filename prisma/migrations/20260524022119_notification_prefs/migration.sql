-- CreateTable
CREATE TABLE "notification_prefs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "new_pachanga" BOOLEAN NOT NULL DEFAULT true,
    "only_my_level" BOOLEAN NOT NULL DEFAULT true,
    "cat_masculino" BOOLEAN NOT NULL DEFAULT true,
    "cat_femenino" BOOLEAN NOT NULL DEFAULT true,
    "cat_mixto" BOOLEAN NOT NULL DEFAULT true,
    "plaza_libre" BOOLEAN NOT NULL DEFAULT false,
    "recordatorio" BOOLEAN NOT NULL DEFAULT true,
    "minutes_before" INTEGER NOT NULL DEFAULT 60,
    "alguien_se_apunta" BOOLEAN NOT NULL DEFAULT true,
    "court_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_prefs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_prefs_user_id_key" ON "notification_prefs"("user_id");

-- AddForeignKey
ALTER TABLE "notification_prefs" ADD CONSTRAINT "notification_prefs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_prefs" ADD CONSTRAINT "notification_prefs_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
