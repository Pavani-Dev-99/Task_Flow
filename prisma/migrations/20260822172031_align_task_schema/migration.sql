/*
  Warnings:

  - You are about to drop the column `due_date` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `notes` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stop_time` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `tasks` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `tasks_due_date_idx` ON `tasks`;

-- DropIndex
DROP INDEX `tasks_status_idx` ON `tasks`;

-- AlterTable
ALTER TABLE `tasks` DROP COLUMN `due_date`,
    DROP COLUMN `status`,
    DROP COLUMN `title`,
    ADD COLUMN `notes` TEXT NOT NULL,
    ADD COLUMN `start_time` DATETIME(3) NOT NULL,
    ADD COLUMN `stop_time` DATETIME(3) NOT NULL,
    MODIFY `description` TEXT NOT NULL;

-- CreateIndex
CREATE INDEX `tasks_start_time_idx` ON `tasks`(`start_time`);

-- CreateIndex
CREATE INDEX `tasks_stop_time_idx` ON `tasks`(`stop_time`);
