import { Link } from 'react-router-dom';
import { Note, Steps } from '../components';
import { useApp } from '../../state/app';
import type { Lesson } from './types';

const tour: Lesson = {
  id: 'app-tour',
  title: 'Getting around the app',
  section: 'The app',
  summary: 'The timer, the shortcuts, how the trainer chooses, and where your data lives.',
  minutes: 5,
  Body: () => {
    const updateSettings = useApp((s) => s.updateSettings);
    return (
      <>
        <h3>The timer</h3>
        <Steps
          items={[
            <>
              Hold <kbd>Space</kbd> until the panel turns green, release to start, press any key to
              stop. On a touchscreen, hold the panel instead. <kbd>Esc</kbd> cancels.
            </>,
            <>
              Turn on <strong>inspection</strong> in Settings for the competition countdown, with the
              two-second and DNF penalties for overrunning it.
            </>,
            <>
              Tap any time in the list to add a <strong>+2</strong>, mark it <strong>DNF</strong>,
              write a note, or delete it.
            </>,
          ]}
        />

        <h3>Scrambles</h3>
        <p>
          2x2 and 3x3 use <strong>random-state</strong> scrambles: a cube position is drawn at random
          and then solved backwards, so every position is equally likely and no scramble is biased.
          Bigger cubes use the random move sequences the WCA specifies, because random-state
          scrambling is impractical at that size. The timer says which it is using.
        </p>
        <p>
          "Show preview" draws the cube the scramble produces — useful if you think you have
          misapplied it.
        </p>

        <h3>The trainer</h3>
        <p>
          Pick a set, filter down to the shapes or the progress level you want, and drill. The
          trainer keeps a time for every case and weights what comes next towards cases you have
          never seen, cases you are still learning, and cases that are slow compared with the rest of
          your set. Star a case to see it twice as often.
        </p>
        <p>
          Setups include a random turn of the top layer, so you meet each case from different angles
          rather than only the one you first learned it from.
        </p>

        <h3>Your data</h3>
        <Note title="Nothing is uploaded">
          Every solve is stored on this device. There is no account and no sync — which also means
          there is no backup unless you make one. Export from Settings to move your history between
          the Windows app and the web, or just to keep a copy. Import reads this app's files and
          csTimer exports.
        </Note>

        <p>
          <Link className="lesson-cta" to="/settings">Open Settings</Link>{' '}
          <button
            className="ghost"
            style={{ marginLeft: 8 }}
            onClick={() => void updateSettings({ tourSeen: false })}
          >
            Replay the welcome tour
          </button>
        </p>
      </>
    );
  },
};

export const APP_LESSONS: Lesson[] = [tour];
