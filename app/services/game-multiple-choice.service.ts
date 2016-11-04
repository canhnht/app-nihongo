import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {DbService} from './db.service';
import {Toast} from 'ionic-native';

export enum QuestionType {
  KanjiToHiragana_Text,
  HiraganaToKanji_Text,
  KanjiToHiragana_Voice,
  HiraganaToKanji_Voice,
};

@Injectable()
export class GameMultipleChoiceService {
  currentLevel: number;
  numberQuestions: number;
  timeLimit: number;
  listQuestion: any[];
  listWord: any[];

  constructor(private dbService: DbService) {
    this.dbService.getGameMultipleChoice().then(
      data => this.currentLevel = data.currentLevel
    );
    this.dbService.gameMultipleChoiceSubject.subscribe(
      data => this.currentLevel = data.currentLevel
    );
    this.listWord = this.dbService.getWordsOfAllCourses();
  }

  shuffleWords() {
    for (let i = this.listWord.length - 1; i >= 0; --i) {
      let k = Math.floor(Math.random() * (i + 1));
      let temp = this.listWord[i];
      this.listWord[i] = this.listWord[k];
      this.listWord[k] = temp;
    }
  }

  generateListQuestion() {
    if (this.listWord.length == 0) return false;
    this.shuffleWords();
    this.numberQuestions = this.getNumberQuestions();
    this.timeLimit = this.getTimeLimit();
    let types = [
      QuestionType.KanjiToHiragana_Text,
      QuestionType.HiraganaToKanji_Text,
      QuestionType.KanjiToHiragana_Voice,
      QuestionType.HiraganaToKanji_Voice
    ];
    this.listQuestion = this.listWord.slice(0, this.numberQuestions).map(word => {
      let questionType = types[Math.floor(Math.random() * types.length)];
      return this.generateQuestion(word, questionType);
    });
    return true;
  }

  generateQuestion(word, questionType) {
    let question: any = {
      type: questionType
    };
    if (questionType == QuestionType.KanjiToHiragana_Text
      || questionType == QuestionType.KanjiToHiragana_Voice) {
      question.question = word.kanji;
      let otherOptions = this.getOtherOptions(3).map(word => word.hira_kata);
      question.options = [word.hira_kata, ...otherOptions];
      question.answer = 0;
    } else if (questionType == QuestionType.HiraganaToKanji_Text
      || questionType == QuestionType.HiraganaToKanji_Voice) {
      question.question = word.hira_kata;
      let otherOptions = this.getOtherOptions(3).map(word => word.kanji);
      question.options = [word.kanji, ...otherOptions];
      question.answer = 0;
    }
    return this.shuffleAnswer(question);
  }

  getOtherOptions(numberOptions) {
    let startIndex = this.numberQuestions;
    let endIndex = this.listWord.length;
    for (let index = startIndex; index < endIndex; ++index) {
      let randomIndex = index + Math.floor(Math.random() * (endIndex - index));
      let temp = this.listWord[index];
      this.listWord[index] = this.listWord[randomIndex];
      this.listWord[randomIndex] = temp;
    }
    return this.listWord.slice(startIndex, startIndex + numberOptions);
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

  getTimeLimit() {
    if (this.currentLevel <= 10) return 45;
    if (this.currentLevel <= 20) return 40;
    if (this.currentLevel <= 30) return 35;
    if (this.currentLevel <= 40) return 35;
    if (this.currentLevel <= 50) return 30;
    if (this.currentLevel <= 60) return 30;
    if (this.currentLevel <= 70) return 25;
    if (this.currentLevel <= 80) return 20;
    if (this.currentLevel <= 90) return 20;
    return 15;
  }

  getNumberQuestions() {
    return 3 + this.currentLevel;
  }


}
