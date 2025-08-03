/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('OPERATOR', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "password" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'OPERATOR';
