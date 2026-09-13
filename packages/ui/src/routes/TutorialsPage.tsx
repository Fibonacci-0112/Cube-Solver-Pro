/**
 * The tutorial library: an index of everything, and a reader for one lesson.
 *
 * Lessons are reading material with no progress to track, so there is nothing
 * stored here and nothing to reset.
 */

import { Link, Route, Routes, useParams } from 'react-router-dom';
import { LESSONS, SECTIONS, findLesson, lessonsIn } from '../tutorials/lessons';

function LessonIndex() {
  return (
    <div className="page page-wide">
      <header className="page-header">
        <h1>Tutorials</h1>
        <p>
          {LESSONS.length} guides, from what the letters mean through to parity on a 4x4. Read them in
          any order — nothing is locked and nothing is tracked.
        </p>
      </header>

      {SECTIONS.map((section) => (
        <section key={section} className="lesson-section">
          <h2>{section}</h2>
          <div className="lesson-index">
            {lessonsIn(section).map((lesson) => (
              <Link className="card lesson-link" key={lesson.id} to={`/tutorials/${lesson.id}`}>
                <strong>{lesson.title}</strong>
                <span className="muted">{lesson.summary}</span>
                <span className="lesson-minutes">{lesson.minutes} min read</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function LessonReader() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = lessonId ? findLesson(lessonId) : undefined;

  if (!lesson) {
    return (
      <div className="page page-narrow">
        <div className="empty">
          That tutorial does not exist. <Link to="/tutorials">Back to the list</Link>.
        </div>
      </div>
    );
  }

  const index = LESSONS.indexOf(lesson);
  const previous = LESSONS[index - 1];
  const next = LESSONS[index + 1];
  const Body = lesson.Body;
  const wide = lesson.section === 'Solve along';

  return (
    <div className={`page ${wide ? 'page-wide' : 'page-narrow'}`}>
      <Link className="lesson-back" to="/tutorials">
        ← All tutorials
      </Link>
      <header className="page-header lesson-header">
        <span className="lesson-section-tag">{lesson.section}</span>
        <h1>{lesson.title}</h1>
        <p>{lesson.summary}</p>
      </header>

      <article className="lesson-body">
        <Body />
      </article>

      <nav className="lesson-nav">
        {previous ? (
          <Link className="card lesson-nav-link" to={`/tutorials/${previous.id}`}>
            <span className="muted">Previous</span>
            <strong>{previous.title}</strong>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link className="card lesson-nav-link is-next" to={`/tutorials/${next.id}`}>
            <span className="muted">Next</span>
            <strong>{next.title}</strong>
          </Link>
        )}
      </nav>
    </div>
  );
}

export function TutorialsPage() {
  return (
    <Routes>
      <Route index element={<LessonIndex />} />
      <Route path=":lessonId" element={<LessonReader />} />
    </Routes>
  );
}
