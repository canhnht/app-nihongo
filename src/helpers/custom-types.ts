
export enum QuestionType {
  KanjiToHiragana_Text,
  HiraganaToKanji_Text,
  KanjiToHiragana_Voice,
  HiraganaToKanji_Voice,
};

export enum SettingStatus {
  Selecting, Playing, None
};

export enum UnitStatus {
  Open = 0,
  Lock = 1,
  Current = 2,
  Pass = 3
};

export enum SlideType {
  Word, MultipleChoiceQuestion
};
