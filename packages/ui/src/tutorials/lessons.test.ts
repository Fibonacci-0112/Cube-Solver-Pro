import { describe, expect, it } from 'vitest';
import { LESSONS, SECTIONS, findLesson, lessonsIn } from './lessons';

describe('tutorial library', () => {
  it('has a unique id per lesson', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses url-safe ids', () => {
    for (const lesson of LESSONS) {
      expect(lesson.id, lesson.title).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('puts every lesson in a section that is actually listed', () => {
    for (const lesson of LESSONS) {
      expect(SECTIONS, lesson.title).toContain(lesson.section);
    }
  });

  it('has no empty sections', () => {
    for (const section of SECTIONS) {
      expect(lessonsIn(section).length, section).toBeGreaterThan(0);
    }
  });

  it('gives every lesson a title, a summary and a reading time', () => {
    for (const lesson of LESSONS) {
      expect(lesson.title.length, lesson.id).toBeGreaterThan(3);
      expect(lesson.summary.length, lesson.id).toBeGreaterThan(10);
      expect(lesson.minutes, lesson.id).toBeGreaterThan(0);
    }
  });

  it('covers everything that was asked for', () => {
    expect(LESSONS.length).toBe(27);
    expect(lessonsIn('Learn to solve').length).toBe(14);
    expect(lessonsIn('Solve along').length).toBe(2);
    expect(lessonsIn('Getting faster').length).toBe(7);
    expect(lessonsIn('Big cubes').length).toBe(3);
    expect(lessonsIn('The app').length).toBe(1);
  });

  it('looks a lesson up by id, and returns nothing for one that does not exist', () => {
    expect(findLesson('notation')?.title).toContain('Notation');
    expect(findLesson('no-such-lesson')).toBeUndefined();
  });
});
