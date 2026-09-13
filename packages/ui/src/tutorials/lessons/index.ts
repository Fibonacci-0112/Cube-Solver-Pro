/**
 * The tutorial library.
 *
 * Lessons are reading material: there is no progress tracking, nothing to
 * reset, and nothing that needs to be completed in order. Adding one means
 * writing it and listing it here.
 */

import { BASIC_LESSONS } from './basics';
import { CFOP_LESSONS } from './cfop';
import { GUIDED_LESSONS } from './guided';
import { IMPROVING_LESSONS } from './improving';
import { BIG_CUBE_LESSONS } from './bigcubes';
import { APP_LESSONS } from './app';
import type { Lesson, LessonSection } from './types';

export type { Lesson, LessonSection } from './types';

export const LESSONS: Lesson[] = [
  ...BASIC_LESSONS,
  ...CFOP_LESSONS,
  ...GUIDED_LESSONS,
  ...IMPROVING_LESSONS,
  ...BIG_CUBE_LESSONS,
  ...APP_LESSONS,
];

/** Sections in the order they are presented. */
export const SECTIONS: LessonSection[] = [
  'Learn to solve',
  'Solve along',
  'Getting faster',
  'Big cubes',
  'The app',
];

export const lessonsIn = (section: LessonSection): Lesson[] =>
  LESSONS.filter((lesson) => lesson.section === section);

export const findLesson = (id: string): Lesson | undefined =>
  LESSONS.find((lesson) => lesson.id === id);
