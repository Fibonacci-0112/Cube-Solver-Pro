/**
 * A short first-run walkthrough. Shown once, dismissible at any point, and
 * available again from Settings.
 */

import { useState } from 'react';
import { useApp } from '../state/app';

const STEPS = [
  {
    title: 'Welcome to Cube Improver',
    body: (
      <>
        <p>
          A timer, a scramble generator and an algorithm trainer in one place. Everything is stored
          on this device — there is no account, and nothing is uploaded.
        </p>
        <p>Four screens are worth knowing about. This takes about thirty seconds.</p>
      </>
    ),
  },
  {
    title: 'The timer',
    body: (
      <>
        <p>
          Hold <kbd>Space</kbd> until the panel turns green, release to start, and press any key to
          stop. On a touchscreen, hold the timer panel instead.
        </p>
        <p>
          Scrambles for 2x2 and 3x3 are random-state: a cube position is drawn at random and then
          solved backwards, so every position is equally likely. Bigger cubes use the random move
          sequences the WCA specifies.
        </p>
      </>
    ),
  },
  {
    title: 'Statistics',
    body: (
      <>
        <p>
          Averages work the way they do in competition: the fastest and slowest solves are dropped
          before the mean, and a DNF counts as the slowest one you had.
        </p>
        <p>
          Tap any time in the list to add a <strong>+2</strong>, mark it <strong>DNF</strong>, leave
          yourself a note, or delete it.
        </p>
      </>
    ),
  },
  {
    title: 'The trainer',
    body: (
      <>
        <p>
          Pick an algorithm set, set the case up on your cube with the moves shown, and solve it.
          The trainer keeps a time for every case and returns more often to the ones costing you
          the most — so your practice goes where it is actually needed.
        </p>
        <p>
          New to this? The <strong>Tutorials</strong> section starts from notation and works up.
        </p>
      </>
    ),
  },
];

export function WelcomeTour() {
  const tourSeen = useApp((s) => s.settings.tourSeen);
  const updateSettings = useApp((s) => s.updateSettings);
  const [step, setStep] = useState(0);

  if (tourSeen) return null;

  const finish = () => {
    void updateSettings({ tourSeen: true });
    setStep(0);
  };
  const last = step === STEPS.length - 1;

  return (
    <div className="tour-backdrop" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="tour">
        <h2>{STEPS[step].title}</h2>
        {STEPS[step].body}
        <div className="tour-steps" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s.title} className={`tour-dot ${i <= step ? 'is-active' : ''}`} />
          ))}
        </div>
        <div className="row">
          <button className="ghost" onClick={finish}>Skip</button>
          <div className="nav-spacer" />
          {step > 0 && <button onClick={() => setStep(step - 1)}>Back</button>}
          <button className="primary" onClick={() => (last ? finish() : setStep(step + 1))}>
            {last ? 'Start cubing' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
