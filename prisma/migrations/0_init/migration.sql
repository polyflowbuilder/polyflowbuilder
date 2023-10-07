-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createDateUTC` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `lastLoginTimeUTC` DATETIME(0) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeedbackReport` (
    `id` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `feedback` TEXT NOT NULL,
    `submittedUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Token` (
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `type` ENUM('SESSION', 'PASSWORD_RESET') NOT NULL,
    `expiresUTC` DATETIME(0) NOT NULL,

    PRIMARY KEY (`email`, `type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flowchart` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `programId1` VARCHAR(191) NOT NULL,
    `programId2` VARCHAR(191) NULL,
    `programId3` VARCHAR(191) NULL,
    `programId4` VARCHAR(191) NULL,
    `programId5` VARCHAR(191) NULL,
    `startYear` VARCHAR(191) NOT NULL,
    `unitTotal` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(2000) NOT NULL,
    `termData` JSON NOT NULL,
    `version` INTEGER NOT NULL,
    `hash` VARCHAR(191) NOT NULL,
    `validationData` JSON NULL,
    `publishedId` VARCHAR(191) NULL,
    `importedId` VARCHAR(191) NULL,
    `lastUpdatedUTC` DATETIME(0) NULL,
    `pos` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` JSON NOT NULL,
    `createdUTC` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TemplateFlowchart` (
    `programId` VARCHAR(191) NOT NULL,
    `flowUnitTotal` VARCHAR(191) NOT NULL,
    `termData` JSON NOT NULL,
    `version` INTEGER NOT NULL,
    `notes` VARCHAR(2000) NOT NULL,

    PRIMARY KEY (`programId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StartYear` (
    `year` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`year`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Catalog` (
    `catalog` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`catalog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Program` (
    `id` VARCHAR(191) NOT NULL,
    `catalog` VARCHAR(191) NOT NULL,
    `majorName` VARCHAR(191) NOT NULL,
    `concName` VARCHAR(191) NULL,
    `code` VARCHAR(191) NOT NULL,
    `dataLink` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` VARCHAR(191) NOT NULL,
    `catalog` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `units` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(1000) NOT NULL,
    `addl` VARCHAR(1000) NOT NULL,
    `gwrCourse` BOOLEAN NOT NULL,
    `uscpCourse` BOOLEAN NOT NULL,

    FULLTEXT INDEX `Course_id_idx`(`id`),
    FULLTEXT INDEX `Course_displayName_idx`(`displayName`),
    PRIMARY KEY (`id`, `catalog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GECourse` (
    `id` VARCHAR(191) NOT NULL,
    `catalog` VARCHAR(191) NOT NULL,
    `category` ENUM('A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'B4', 'UPPER_DIVISION_B', 'C1', 'C2', 'UPPER_DIVISION_C', 'D1', 'D2', 'UPPER_DIVISION_D', 'E', 'F') NOT NULL,

    PRIMARY KEY (`category`, `id`, `catalog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourseRequisite` (
    `id` VARCHAR(191) NOT NULL,
    `catalog` VARCHAR(191) NOT NULL,
    `prerequisite` JSON NOT NULL,
    `corequisite` JSON NOT NULL,
    `recommended` JSON NOT NULL,
    `concurrent` JSON NOT NULL,

    PRIMARY KEY (`id`, `catalog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TermTypicallyOffered` (
    `id` VARCHAR(191) NOT NULL,
    `catalog` VARCHAR(191) NOT NULL,
    `termSummer` BOOLEAN NOT NULL,
    `termFall` BOOLEAN NOT NULL,
    `termWinter` BOOLEAN NOT NULL,
    `termSpring` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`, `catalog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_email_fkey` FOREIGN KEY (`email`) REFERENCES `User`(`email`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flowchart` ADD CONSTRAINT `Flowchart_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flowchart` ADD CONSTRAINT `Flowchart_startYear_fkey` FOREIGN KEY (`startYear`) REFERENCES `StartYear`(`year`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flowchart` ADD CONSTRAINT `Flowchart_programId1_fkey` FOREIGN KEY (`programId1`) REFERENCES `Program`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flowchart` ADD CONSTRAINT `Flowchart_programId2_fkey` FOREIGN KEY (`programId2`) REFERENCES `Program`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flowchart` ADD CONSTRAINT `Flowchart_programId3_fkey` FOREIGN KEY (`programId3`) REFERENCES `Program`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flowchart` ADD CONSTRAINT `Flowchart_programId4_fkey` FOREIGN KEY (`programId4`) REFERENCES `Program`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flowchart` ADD CONSTRAINT `Flowchart_programId5_fkey` FOREIGN KEY (`programId5`) REFERENCES `Program`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TemplateFlowchart` ADD CONSTRAINT `TemplateFlowchart_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_catalog_fkey` FOREIGN KEY (`catalog`) REFERENCES `Catalog`(`catalog`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_catalog_fkey` FOREIGN KEY (`catalog`) REFERENCES `Catalog`(`catalog`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GECourse` ADD CONSTRAINT `GECourse_id_catalog_fkey` FOREIGN KEY (`id`, `catalog`) REFERENCES `Course`(`id`, `catalog`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseRequisite` ADD CONSTRAINT `CourseRequisite_id_catalog_fkey` FOREIGN KEY (`id`, `catalog`) REFERENCES `Course`(`id`, `catalog`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermTypicallyOffered` ADD CONSTRAINT `TermTypicallyOffered_id_catalog_fkey` FOREIGN KEY (`id`, `catalog`) REFERENCES `Course`(`id`, `catalog`) ON DELETE RESTRICT ON UPDATE CASCADE;

