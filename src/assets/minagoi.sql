-- Init database for MINAGOI

-- Create table `course`
DROP TABLE IF EXISTS `course`;
CREATE TABLE IF NOT EXISTS `course` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  `free` BOOLEAN NOT NULL DEFAULT 1,
  `downloaded` BOOLEAN NOT NULL DEFAULT 0,
  `noWords` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);

-- Data for table `course`
INSERT INTO `course` (`id`, `name`, `free`, `downloaded`, `noWords`) VALUES
  ('course1', 'N3', 1, 0, 0);



-- Create table `unit`
DROP TABLE IF EXISTS `unit`;
CREATE TABLE IF NOT EXISTS `unit` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `number` INTEGER NOT NULL DEFAULT 0,
  `locked` BOOLEAN NOT NULL DEFAULT 0,
  `noWords` INTEGER NOT NULL DEFAULT 0,
  `courseId` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Data for table `unit`
INSERT INTO `unit` (`id`, `name`, `number`, `locked`, `noWords`, `courseId`) VALUES
  ('unit1', 'Unit 1', 1, 0, 0, 'course1'),
  ('unit2', 'Unit 2', 2, 0, 0, 'course1'),
  ('unit3', 'Unit 3', 3, 0, 0, 'course1');



-- Create table `playlist`
DROP TABLE IF EXISTS `playlist`;
CREATE TABLE IF NOT EXISTS `playlist` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `noWords` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);

-- Data for table `playlist`
INSERT INTO `playlist` (`id`, `name`) VALUES
  ('playlist1', 'My favorites'),
  ('playlist2', 'My list');



-- Create table `word`
DROP TABLE IF EXISTS `word`;
CREATE TABLE IF NOT EXISTS `word` (
  `id` VARCHAR(50) NOT NULL,
  `kanji` NVARCHAR(50) NOT NULL,
  `mainExample` NVARCHAR(1000) NOT NULL DEFAULT 'null',
  `meaning` NVARCHAR(1000) NOT NULL DEFAULT '[]',
  `otherExamples` NVARCHAR(10000) NOT NULL DEFAULT '[]',
  `phonetic` NVARCHAR(1000) NOT NULL DEFAULT '[]',
  `audioFile` VARCHAR(255),
  `audioDuration` DOUBLE DEFAULT 0,
  `unitId` VARCHAR(50) NOT NULL,
  `playlistId` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`unitId`) REFERENCES `unit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`playlistId`) REFERENCES `playlist` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

