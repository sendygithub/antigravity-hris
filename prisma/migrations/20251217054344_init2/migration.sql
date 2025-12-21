/*
  Warnings:

  - The `checkOut` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `checkIn` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "checkIn",
ADD COLUMN     "checkIn" TIMESTAMP(3) NOT NULL,
DROP COLUMN "checkOut",
ADD COLUMN     "checkOut" TIMESTAMP(3);
