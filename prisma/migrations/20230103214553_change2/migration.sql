-- AlterTable
ALTER TABLE "User" ALTER COLUMN "resetToken" DROP NOT NULL,
ALTER COLUMN "resetTokenExpiration" DROP NOT NULL;
