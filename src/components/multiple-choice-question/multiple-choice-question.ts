import { Component, Input, OnInit } from '@angular/core';
import { NativeAudio } from 'ionic-native';
import _ from 'lodash';

enum QuestionType {
  KanjiToHiragana_Text,
  HiraganaToKanji_Text,
  KanjiToHiragana_Voice,
  HiraganaToKanji_Voice,
};

@Component({
  selector: 'multiple-choice-question',
  templateUrl: 'multiple-choice-question.html'
})
export class MultipleChoiceQuestion implements OnInit {
  @Input() word: any;
  @Input() words: any[];
  question: any;
  selectedOption: number;
  isCorrect: boolean;

  constructor() {
  }

  ngOnInit() {
    this.words = this.words.filter((word) => word.id !== this.word.id);
    this.question = this.generateQuestion(this.word);
  }

  generateQuestion(word) {
    let types = [
      QuestionType.KanjiToHiragana_Text,
      QuestionType.HiraganaToKanji_Text,
      QuestionType.KanjiToHiragana_Voice,
      QuestionType.HiraganaToKanji_Voice
    ];
    let questionType = types[Math.floor(Math.random() * types.length)];
    let question: any = {
      type: questionType
    };
    if (questionType == QuestionType.KanjiToHiragana_Text
      || questionType == QuestionType.KanjiToHiragana_Voice) {
      question.question = word.kanji;
      let otherOptions = this.getOtherOptions(3).map((word) => word.phonetic[0]);
      question.options = [word.phonetic[0], ...otherOptions];
      question.answer = 0;
    } else if (questionType == QuestionType.HiraganaToKanji_Text
      || questionType == QuestionType.HiraganaToKanji_Voice) {
      question.question = word.phonetic[0];
      let otherOptions = this.getOtherOptions(3).map(word => word.kanji);
      question.options = [word.kanji, ...otherOptions];
      question.answer = 0;
    }
    return this.shuffleAnswer(question);
  }

  getOtherOptions(numberOptions) {
    let startIndex = 0;
    let endIndex = this.words.length;
    for (let index = startIndex; index < endIndex; ++index) {
      let randomIndex = index + Math.floor(Math.random() * (endIndex - index));
      let temp = this.words[index];
      this.words[index] = this.words[randomIndex];
      this.words[randomIndex] = temp;
    }
    return this.words.slice(startIndex, startIndex + numberOptions);
  }

  shuffleAnswer(question) {
    question = Object.assign({}, question);
    let randomIndex = 1 + Math.floor(Math.random() * 3);
    let temp = question.options[0];
    question.options[0] = question.options[randomIndex];
    question.options[randomIndex] = temp;
    question.answer = randomIndex;
    return question;
  }

  isTextQuestion(question) {
    return question.type == QuestionType.KanjiToHiragana_Text
      || question.type == QuestionType.HiraganaToKanji_Text;
  }

  isVoiceQuestion(question) {
    return question.type == QuestionType.KanjiToHiragana_Voice
      || question.type == QuestionType.HiraganaToKanji_Voice;
  }

  select(question, optionIndex) {
    this.selectedOption = optionIndex;
    this.isCorrect = this.selectedOption === question.answer;
    if (!this.isCorrect) {
      NativeAudio.play('incorrect');
    } else {
      NativeAudio.play('correct');
    }
  }
}
