import type { ComponentType } from 'react';

export type LessonSection =
  | 'Learn to solve'
  | 'Solve along'
  | 'Getting faster'
  | 'Big cubes'
  | 'The app';

export interface Lesson {
  /** URL slug. */
  id: string;
  title: string;
  section: LessonSection;
  /** One line for the index page. */
  summary: string;
  minutes: number;
  Body: ComponentType;
}
