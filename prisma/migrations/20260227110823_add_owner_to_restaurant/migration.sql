/*
  Warnings:

  - Added the required column `owner_id` to the `restaurants` table without a default value. This is not possible if the table is not empty.

*/

-- Créer un utilisateur par défaut avec le rôle owner si aucun n'existe
INSERT INTO "users" ("email", "password", "role", "created_at", "updated_at")
SELECT 'default-owner@nexuseats.dev', '$2b$10$defaulthash', 'owner', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE "email" = 'default-owner@nexuseats.dev');

-- AlterTable : Ajouter la colonne avec une valeur par défaut temporaire
ALTER TABLE "restaurants" ADD COLUMN "owner_id" INTEGER;

-- Assigner tous les restaurants existants à l'utilisateur par défaut
UPDATE "restaurants" 
SET "owner_id" = (SELECT "id" FROM "users" WHERE "email" = 'default-owner@nexuseats.dev' LIMIT 1)
WHERE "owner_id" IS NULL;

-- Rendre la colonne NOT NULL maintenant qu'elle a des valeurs
ALTER TABLE "restaurants" ALTER COLUMN "owner_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
