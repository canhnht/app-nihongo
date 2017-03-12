-- Create table `course`
CREATE TABLE `course` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  `level` VARCHAR(50) NOT NULL,
  `imageUrl` VARCHAR(255) DEFAULT NULL,
  `free` BOOLEAN NOT NULL DEFAULT 1,
  `downloaded` BOOLEAN NOT NULL DEFAULT 0,
  `noWords` INTEGER NOT NULL DEFAULT 0,
  `noUnits` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);
----

-- Data for table `course`
INSERT INTO `course` (`id`, `imageUrl`, `level`, `name`, `free`, `downloaded`, `noWords`, `noUnits`) VALUES
  ('course1', 'assets/images/sample-course.jpg', 'N3', 'Mimi Kara Oboeru N3', 1, 0, 0, 0);
----



-- Create table `unit`
CREATE TABLE `unit` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `imageUrl` TEXT DEFAULT NULL,
  `number` INTEGER NOT NULL DEFAULT 0,
  `state` BOOLEAN NOT NULL DEFAULT 0,
  `noWords` INTEGER NOT NULL DEFAULT 0,
  `courseId` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
);
----



-- Create table `playlist`
CREATE TABLE `playlist` (
  `id` VARCHAR(50) NOT NULL,
  `name` NVARCHAR(255) NOT NULL,
  `noWords` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
----

-- Data for table `playlist`
INSERT INTO `playlist` (`id`, `name`) VALUES
  ('playlist1', 'Các từ yêu thích');
----



-- Create table `word`
CREATE TABLE `word` (
  `id` VARCHAR(50) NOT NULL,
  `kanji` NVARCHAR(100) NOT NULL,
  `mainExample` TEXT NOT NULL DEFAULT 'null',
  `meaning` TEXT DEFAULT '[]',
  `otherExamples` TEXT DEFAULT '[]',
  `phonetic` TEXT DEFAULT '[]',
  `audioFolder` VARCHAR(255),
  `audioFile` VARCHAR(255),
  `audioDuration` DOUBLE DEFAULT 0,
  `unitId` VARCHAR(50) NOT NULL,
  `lastPlayed` INTEGER(11) DEFAULT NULL,
  `timesPlayed` INTEGER DEFAULT 0,
  PRIMARY KEY (`id`)
);
----



-- Create table `word_playlist`
CREATE TABLE `word_playlist` (
  `wordId` VARCHAR(50) NOT NULL,
  `playlistId` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`wordId`, `playlistId`)
);
----



-- Create table `news`
CREATE TABLE `news` (
  `id` VARCHAR(50) NOT NULL,
  `title` TEXT NOT NULL,
  `titleWithRuby` TEXT NOT NULL,
  `outlineWithRuby` TEXT NOT NULL,
  `contentWithRuby` TEXT NOT NULL,
  `imageUrl` VARCHAR(255) DEFAULT NULL,
  `voiceUrl` VARCHAR(255) DEFAULT NULL,
  `date` VARCHAR(100) DEFAULT NULL,
  `dateText` NVARCHAR(100) DEFAULT NULL,
  `sourceUrl` VARCHAR(255) DEFAULT NULL,
  `words` TEXT NOT NULL,
  PRIMARY KEY (`id`)
);
----



-- Create triggers
DROP TRIGGER IF EXISTS `increase_noWords_unit`;
----
CREATE TRIGGER IF NOT EXISTS `increase_noWords_unit` AFTER INSERT ON `word`
  BEGIN
    UPDATE `unit` SET `noWords` = `noWords` + 1 WHERE `id` = new.unitId;
  END;
----

DROP TRIGGER IF EXISTS `update_noWords_course`;
----
CREATE TRIGGER IF NOT EXISTS `update_noWords_course` AFTER UPDATE OF `noWords` ON `unit`
  BEGIN
    UPDATE `course` SET `noWords` = `noWords` - old.noWords + new.noWords WHERE `id` = old.courseId;
  END;
----

DROP TRIGGER IF EXISTS `increase_noUnits_course`;
----
CREATE TRIGGER IF NOT EXISTS `increase_noUnits_course` AFTER INSERT ON `unit`
  BEGIN
    UPDATE `course` SET `noUnits` = `noUnits` + 1 WHERE `id` = new.courseId;
  END;
----

DROP TRIGGER IF EXISTS `decrease_noWords_playlist`;
----
CREATE TRIGGER IF NOT EXISTS `decrease_noWords_playlist` AFTER DELETE ON `word_playlist`
  BEGIN
    UPDATE `playlist` SET `noWords` = `noWords` - 1 WHERE `id` = old.playlistId;
  END;
----

DROP TRIGGER IF EXISTS `increase_noWords_playlist`;
----
CREATE TRIGGER IF NOT EXISTS `increase_noWords_playlist` AFTER INSERT ON `word_playlist`
  BEGIN
    UPDATE `playlist` SET `noWords` = `noWords` + 1 WHERE `id` = new.playlistId;
  END;
----

-- .read src/assets/minagoi.sql
