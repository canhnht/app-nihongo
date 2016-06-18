import {Lesson} from './lesson.interface';

export interface Unit {
    id: number,
    title: string,
    lessons: Lesson[],
}
