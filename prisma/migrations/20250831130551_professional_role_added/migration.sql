/*
  Warnings:

  - You are about to drop the column `role` on the `Professional` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `Professional` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Professional" DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProfessionalRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ProfessionalRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalRole_name_key" ON "ProfessionalRole"("name");

-- AddForeignKey
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ProfessionalRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
