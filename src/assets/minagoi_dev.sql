-- Init database for MINAGOI
PRAGMA foreign_keys = ON;

-- Create table `course`
DROP TABLE IF EXISTS `course`;
CREATE TABLE IF NOT EXISTS `course` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT '',
  `free` BOOLEAN NOT NULL DEFAULT 1,
  `downloaded` BOOLEAN NOT NULL DEFAULT 0,
  `noWords` INTEGER NOT NULL DEFAULT 0,
  `noUnits` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);

-- Data for table `course`
INSERT INTO `course` (`id`, `name`, `free`, `downloaded`, `noWords`, `noUnits`) VALUES
  ('course1', 'N3', 1, 0, 2, 3);



-- Create table `unit`
DROP TABLE IF EXISTS `unit`;
CREATE TABLE IF NOT EXISTS `unit` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `number` INTEGER NOT NULL DEFAULT 0,
  `locked` BOOLEAN NOT NULL DEFAULT 1,
  `noWords` INTEGER NOT NULL DEFAULT 0,
  `courseId` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Data for table `unit`
INSERT INTO `unit` (`id`, `name`, `number`, `locked`, `noWords`, `courseId`) VALUES
  ('unit1', 'Unit 1', 1, 0, 1, 'course1'),
  ('unit2', 'Unit 2', 2, 0, 1, 'course1'),
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
  `kanji` NVARCHAR(100) NOT NULL,
  `mainExample` TEXT NOT NULL DEFAULT 'null',
  `meaning` TEXT NOT NULL DEFAULT '[]',
  `otherExamples` TEXT NOT NULL DEFAULT '[]',
  `phonetic` TEXT NOT NULL DEFAULT '[]',
  `audioFile` VARCHAR(255) DEFAULT NULL,
  `audioDuration` DOUBLE DEFAULT 0,
  `unitId` VARCHAR(50) NOT NULL,
  `lastPlayed` INTEGER(11) DEFAULT NULL,
  `timesPlayed` INTEGER DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`unitId`) REFERENCES `unit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Data for table `word`
INSERT INTO `word` (`id`, `kanji`, `mainExample`, `meaning`, `otherExamples`, `phonetic`, `unitId`) VALUES
  ('word1',
    '渇く',
    '{"content":"のどが渇いた。","meaning":"Khát nước."}',
    '[{"kind":"v5k, vi","mean":"khát; khát khô cổ"},{"kind":"v5k, vi","mean":"khô; bị khô"}]',
    '[{"content":"手（のひら）が汗でじっとりとしのどが渇くのを感じる","meaning":"Cảm thấy lòng bàn tày ướt đẫm mồ hôi và khát khô cả cổ","phonetic":"て（のひら）があせでじっとりとしのどがかわくのをかんじる"}]',
    '["かわく"]',
    'unit1'),
  ('word2',
    '渇く',
    '{"content":"のどが渇いた。","meaning":"Khát nước."}',
    '[{"kind":"v5k, vi","mean":"khát; khát khô cổ"},{"kind":"v5k, vi","mean":"khô; bị khô"}]',
    '[{"content":"手（のひら）が汗でじっとりとしのどが渇くのを感じる","meaning":"Cảm thấy lòng bàn tày ướt đẫm mồ hôi và khát khô cả cổ","phonetic":"て（のひら）があせでじっとりとしのどがかわくのをかんじる"}]',
    '["かわく"]',
    'unit2');



-- Create table `word_playlist`
DROP TABLE IF EXISTS `word_playlist`;
CREATE TABLE IF NOT EXISTS `word_playlist` (
  `wordId` VARCHAR(50) NOT NULL,
  `playlistId` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`wordId`, `playlistId`),
  FOREIGN KEY (`wordId`) REFERENCES `word` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`playlistId`) REFERENCES `playlist` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Data for table `word_playlist`
INSERT INTO `word_playlist` (`wordId`, `playlistId`) VALUES
  ('word2', 'playlist2'),
  ('word1', 'playlist2');



-- Create table `news`
DROP TABLE IF EXISTS `news`;
CREATE TABLE IF NOT EXISTS `news` (
  `id` VARCHAR(50) NOT NULL,
  `title` TEXT NOT NULL,
  `titleWithRuby` TEXT NOT NULL,
  `outlineWithRuby` TEXT NOT NULL,
  `contentWithRuby` TEXT NOT NULL,
  `imageUrl` VARCHAR(255) DEFAULT NULL,
  `voiceUrl` VARCHAR(255) DEFAULT NULL,
  `date` DATETIME DEFAULT NULL,
  `dateText` NVARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- Data for table `news`
INSERT INTO `news` (`id`, `title`, `titleWithRuby`, `outlineWithRuby`, `contentWithRuby`, `voiceUrl`, `date`, `dateText`) VALUES
  ('k10010810791000',
    '２０１６年　男が障害がある人を刺して１９人が亡くなる',
    '２０１６<ruby>年<rt>ねん</rt></ruby>　<ruby>男<rt>おとこ</rt></ruby>が<ruby>障害<rt>しょうがい</rt></ruby>がある<ruby>人<rt>ひと</rt></ruby>を<ruby>刺<rt>さ</rt></ruby>して１９<ruby>人<rt>にん</rt></ruby>が<ruby>亡<rt>な</rt></ruby>くなる',
    '<p>７<ruby>月<rt>がつ</rt></ruby>２６<ruby>日<rt>にち</rt></ruby>、<ruby>神奈川県<rt>かながわけん</rt></ruby><ruby>相模原市<rt>さがみはらし</rt></ruby>の<ruby>津久井<rt>つくい</rt></ruby>やまゆり<ruby>園<rt>えん</rt></ruby>の<ruby>建物<rt>たてもの</rt></ruby>に、ナイフを<ruby>持<rt>も</rt></ruby>った<ruby>若<rt>わか</rt></ruby>い<ruby>男<rt>おとこ</rt></ruby>が<ruby>入<rt>はい</rt></ruby>ってきました。',
    '\n<p><img src=\"http://www3.nhk.or.jp/news/easy/manu_still/1229_sagamihara.jpg\" alt=\"\" style=\"margin-left: 120px;\">\n<br>７<ruby>月<rt>がつ</rt></ruby>２６<ruby>日<rt>にち</rt></ruby>、<span class=\"colorL\"><ruby>神奈川県<rt>かながわけん</rt></ruby></span><span class=\"colorL\"><ruby>相模原市<rt>さがみはらし</rt></ruby></span>の<span class=\"colorC\"><ruby>津久井<rt>つくい</rt></ruby>やまゆり<ruby>園<rt>えん</rt></ruby></span>の<ruby>建物<rt>たてもの</rt></ruby>に、ナイフを<ruby>持<rt>も</rt></ruby>った<ruby>若<rt>わか</rt></ruby>い<ruby>男<rt>おとこ</rt></ruby>が<ruby>入<rt>はい</rt></ruby>ってきました。<ruby>男<rt>おとこ</rt></ruby>は<ruby>建物<rt>たてもの</rt></ruby>で<ruby>生活<rt>せいかつ</rt></ruby>していた<ruby><span class=\"under\">知能</span><rt>ちのう</rt></ruby>に<ruby><span class=\"under\">障害</span><rt>しょうがい</rt></ruby>がある<ruby>人<rt>ひと</rt></ruby>たちを<ruby><span class=\"under\">刺</span><rt>さ</rt></ruby><span class=\"under\">し</span>て、１９<ruby>人<rt>にん</rt></ruby>が<ruby>亡<rt>な</rt></ruby>くなりました。</p>\n<p><ruby>警察<rt>けいさつ</rt></ruby>が<ruby><span class=\"under\">逮捕</span><rt>たいほ</rt></ruby>した<ruby>男<rt>おとこ</rt></ruby>は、２<ruby>月<rt>がつ</rt></ruby>まで<span class=\"colorC\"><ruby>津久井<rt>つくい</rt></ruby>やまゆり<ruby>園<rt>えん</rt></ruby></span>で<ruby>働<rt>はたら</rt></ruby>いていました。<ruby>男<rt>おとこ</rt></ruby>は「<ruby><span class=\"under\">障害</span><rt>しょうがい</rt></ruby>がある<ruby>人<rt>ひと</rt></ruby>はいなくなったほうがいいと<ruby>思<rt>おも</rt></ruby>った」などと<ruby>言<rt>い</rt></ruby>いました。<ruby>警察<rt>けいさつ</rt></ruby>などは、<ruby>男<rt>おとこ</rt></ruby>が<ruby><span class=\"under\">事件</span><rt>じけん</rt></ruby>を<ruby><span class=\"under\">起</span><rt>お</rt></ruby><span class=\"under\">こし</span>た<ruby>理由<rt>りゆう</rt></ruby>などを<ruby>調<rt>しら</rt></ruby>べています。</p>\n<p>この<ruby><span class=\"under\">事件</span><rt>じけん</rt></ruby>のあと、<ruby>体<rt>からだ</rt></ruby>や<ruby><span class=\"under\">知能</span><rt>ちのう</rt></ruby>に<ruby><span class=\"under\">障害</span><rt>しょうがい</rt></ruby>がある<ruby>人<rt>ひと</rt></ruby>や<ruby>家族<rt>かぞく</rt></ruby>などが<ruby>集<rt>あつ</rt></ruby>まって、<ruby><span class=\"under\">話</span><rt>はな</rt></ruby><span class=\"under\">し</span><ruby><span class=\"under\">合</span><rt>あ</rt></ruby><span class=\"under\">う</span><ruby>会<rt>かい</rt></ruby>を<ruby>開<rt>ひら</rt></ruby>いています。１０<ruby>月<rt>がつ</rt></ruby>２７<ruby>日<rt>にち</rt></ruby>には<span class=\"colorL\"><ruby>東京<rt>とうきょう</rt></ruby></span>に６００<ruby>人<rt>にん</rt></ruby>が<ruby>集<rt>あつ</rt></ruby>まりました。<span class=\"colorL\"><ruby>埼玉県<rt>さいたまけん</rt></ruby></span>から<ruby>来<rt>き</rt></ruby>た<ruby>女性<rt>じょせい</rt></ruby>は「<ruby><span class=\"under\">障害</span><rt>しょうがい</rt></ruby>がある<ruby>人<rt>ひと</rt></ruby>とない<ruby>人<rt>ひと</rt></ruby>が、お<ruby><span class=\"under\">互</span><rt>たが</rt></ruby><span class=\"under\">い</span>を<ruby><span class=\"under\">理解</span><rt>りかい</rt></ruby>して<ruby>同<rt>おな</rt></ruby>じように<ruby>生活<rt>せいかつ</rt></ruby>できる<ruby>社会<rt>しゃかい</rt></ruby>になるといいと<ruby>思<rt>おも</rt></ruby>います」と<ruby>話<rt>はな</rt></ruby>しました。<br>\n<img src=\"http://www3.nhk.or.jp/news/easy/manu_still/1229_sagamihara2.jpg\" alt=\"\" style=\"margin-left: 120px;\"></p>\n<p></p>\n<p></p>\n              ',
    'http://www3.nhk.or.jp/news/easy/k10010810791000/k10010810791000.mp3',
    '2016-12-29T10:00:00.000Z',
    '[12月29日 10時00分]'),
  ('k10010810791001',
    '２０１６年　男が障害がある人を刺して１９人が亡くなる',
    '２０１６<ruby>年<rt>ねん</rt></ruby>　<ruby>男<rt>おとこ</rt></ruby>が<ruby>障害<rt>しょうがい</rt></ruby>がある<ruby>人<rt>ひと</rt></ruby>を<ruby>刺<rt>さ</rt></ruby>して１９<ruby>人<rt>にん</rt></ruby>が<ruby>亡<rt>な</rt></ruby>くなる',
    '<p>７<ruby>月<rt>がつ</rt></ruby>２６<ruby>日<rt>にち</rt></ruby>、<ruby>神奈川県<rt>かながわけん</rt></ruby><ruby>相模原市<rt>さがみはらし</rt></ruby>の<ruby>津久井<rt>つくい</rt></ruby>やまゆり<ruby>園<rt>えん</rt></ruby>の<ruby>建物<rt>たてもの</rt></ruby>に、ナイフを<ruby>持<rt>も</rt></ruby>った<ruby>若<rt>わか</rt></ruby>い<ruby>男<rt>おとこ</rt></ruby>が<ruby>入<rt>はい</rt></ruby>ってきました。',
    '\n<p><img src=\"http://www3.nhk.or.jp/news/easy/manu_still/1229_sagamihara.jpg\" alt=\"\" style=\"margin-left: 120px;\">\n<br>７<ruby>月<rt>がつ</rt></ruby>２６<ruby>日<rt>にち</rt></ruby>、<span class=\"colorL\"><ruby>神奈川県<rt>かながわけん</rt></ruby></span><span class=\"colorL\"><ruby>相模原市<rt>さがみはらし</rt></ruby></span>の<span class=\"colorC\"><ruby>津久井<rt>つくい</rt></ruby>やまゆり<ruby>園<rt>えん</rt></ruby></span>の<ruby>建物<rt>たてもの</rt></ruby>に、ナイフを<ruby>持<rt>も</rt></ruby>った<ruby>若<rt>わか</rt></ruby>い<ruby>男<rt>おとこ</rt></ruby>が<ruby>入<rt>はい</rt></ruby>ってきました。<ruby>男<rt>おとこ</rt></ruby>は<ruby>建物<rt>たてもの</rt></ruby>で<ruby>生活<rt>せいかつ</rt></ruby>していた<ruby><span class=\"under\">知能</span><rt>ちのう</rt></ruby>に<ruby><span class=\"under\">障害</span><rt>しょうがい</rt></ruby>がある<ruby>人<rt>ひと</rt></ruby>たちを<ruby><span class=\"under\">刺</span><rt>さ</rt></ruby><span class=\"under\">し</span>て、１９<ruby>人<rt>にん</rt></ruby>が<ruby>亡<rt>な</rt></ruby>くなりました。</p>\n<p><ruby>警察<rt>けいさつ</rt></ruby>が<ruby><span class=\"under\">逮捕</span><rt>たいほ</rt></ruby>した<ruby>男<rt>おとこ</rt></ruby>は、２<ruby>月<rt>がつ</rt></ruby>まで<span class=\"colorC\"><ruby>津久井<rt>つくい</rt></ruby>やまゆり<ruby>園<rt>えん</rt></ruby></span>で<ruby>働<rt>はたら</rt></ruby>いていました。<ruby>男<rt>おとこ</rt></ruby>は「<ruby><span class=\"under\">障害</span><rt>しょうがい</rt></ruby>がある<ruby>人<rt>ひと</rt></ruby>はいなくなったほうがいいと<ruby>思<rt>おも</rt></ruby>った」などと<ruby>言<rt>い</rt></ruby>いました。<ruby>警察<rt>けいさつ</rt></ruby>などは、<ruby>男<rt>おとこ</rt></ruby>が<ruby><span class=\"under\">事件</span><rt>じけん</rt></ruby>を<ruby><span class=\"under\">起</span><rt>お</rt></ruby><span class=\"under\">こし</span>た<ruby>理由<rt>りゆう</rt></ruby>などを<ruby>調<rt>しら</rt></ruby>べています。</p>\n<p>この<ruby><span class=\"under\">事件</span><rt>じけん</rt></ruby>のあと、<ruby>体<rt>からだ</rt></ruby>や<ruby><span class=\"under\">知能</span><rt>ちのう</rt></ruby>に<ruby><span class=\"under\">障害</span><rt>しょうがい</rt></ruby>がある<ruby>人<rt>ひと</rt></ruby>や<ruby>家族<rt>かぞく</rt></ruby>などが<ruby>集<rt>あつ</rt></ruby>まって、<ruby><span class=\"under\">話</span><rt>はな</rt></ruby><span class=\"under\">し</span><ruby><span class=\"under\">合</span><rt>あ</rt></ruby><span class=\"under\">う</span><ruby>会<rt>かい</rt></ruby>を<ruby>開<rt>ひら</rt></ruby>いています。１０<ruby>月<rt>がつ</rt></ruby>２７<ruby>日<rt>にち</rt></ruby>には<span class=\"colorL\"><ruby>東京<rt>とうきょう</rt></ruby></span>に６００<ruby>人<rt>にん</rt></ruby>が<ruby>集<rt>あつ</rt></ruby>まりました。<span class=\"colorL\"><ruby>埼玉県<rt>さいたまけん</rt></ruby></span>から<ruby>来<rt>き</rt></ruby>た<ruby>女性<rt>じょせい</rt></ruby>は「<ruby><span class=\"under\">障害</span><rt>しょうがい</rt></ruby>がある<ruby>人<rt>ひと</rt></ruby>とない<ruby>人<rt>ひと</rt></ruby>が、お<ruby><span class=\"under\">互</span><rt>たが</rt></ruby><span class=\"under\">い</span>を<ruby><span class=\"under\">理解</span><rt>りかい</rt></ruby>して<ruby>同<rt>おな</rt></ruby>じように<ruby>生活<rt>せいかつ</rt></ruby>できる<ruby>社会<rt>しゃかい</rt></ruby>になるといいと<ruby>思<rt>おも</rt></ruby>います」と<ruby>話<rt>はな</rt></ruby>しました。<br>\n<img src=\"http://www3.nhk.or.jp/news/easy/manu_still/1229_sagamihara2.jpg\" alt=\"\" style=\"margin-left: 120px;\"></p>\n<p></p>\n<p></p>\n              ',
    'http://www3.nhk.or.jp/news/easy/k10010810791000/k10010810791000.mp3',
    '2016-12-20T10:00:00.000Z',
    '[12月29日 10時00分]');



-- Create triggers
DROP TRIGGER IF EXISTS `update_noWords_unit`;
CREATE TRIGGER IF NOT EXISTS `update_noWords_unit` AFTER DELETE ON `word`
  BEGIN
    UPDATE `unit` SET `noWords` = `noWords` - 1 WHERE `id` = old.unitId;
  END;

DROP TRIGGER IF EXISTS `update_noWords_course`;
CREATE TRIGGER IF NOT EXISTS `update_noWords_course` AFTER UPDATE OF `noWords` ON `unit`
  BEGIN
    UPDATE `course` SET `noWords` = `noWords` - old.noWords + new.noWords WHERE `id` = old.courseId;
  END;

DROP TRIGGER IF EXISTS `delete_course`;
CREATE TRIGGER IF NOT EXISTS `delete_course` AFTER UPDATE OF `noWords` ON `course`
  BEGIN
    DELETE FROM `unit` WHERE `courseId` = (CASE new.noWords WHEN 0 THEN new.id ELSE '' END);
  END;



-- .read src/assets/minagoi_dev.sql
INSERT OR REPLACE INTO `word` (`id`, `kanji`, `audioFile`, `unitId`) VALUES ('word3', 'kj', 'BOB', 'unit1');
