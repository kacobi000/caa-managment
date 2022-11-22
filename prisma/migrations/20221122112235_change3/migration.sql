/*
  Warnings:

  - You are about to drop the column `email` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Worker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "type";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
