import { GuidedSolve } from '../GuidedSolve';
import { Note } from '../components';
import type { Lesson } from './types';

const beginner: Lesson = {
  id: 'solve-along-beginner',
  title: 'Solve along — the beginner method',
  section: 'Solve along',
  summary: 'Turn the cube here and it tells you the next step, whatever state you get into.',
  minutes: 15,
  Body: () => (
    <>
      <p>
        Scramble the cube below and work through it. After every move the app looks at the actual
        state and tells you which step you are on and what to do about it — so you can experiment,
        get lost, and still be picked back up.
      </p>
      <Note title="It is reading the cube, not following a script">
        Nothing here is pre-recorded. Turn the cube any way you like, undo things, scramble halfway
        through a solve: the advice is worked out from the position in front of you.
      </Note>
      <GuidedSolve method="beginner" />
      <p className="muted" style={{ marginTop: 16 }}>
        The best way to use this is alongside a real cube. Copy each move onto the cube in your hands
        and let the app confirm you are where you think you are.
      </p>
    </>
  ),
};

const cfop: Lesson = {
  id: 'solve-along-cfop',
  title: 'Solve along — CFOP',
  section: 'Solve along',
  summary: 'The same, but four steps, naming the exact F2L, OLL and PLL case you are looking at.',
  minutes: 15,
  Body: () => (
    <>
      <p>
        The CFOP version. Once the cross is done it names the specific case in front of you — which
        of the 41 F2L cases, which of the 57 OLLs, which of the 21 PLLs — and gives you the algorithm
        for it.
      </p>
      <Note title="Use it for the cases you do not know yet">
        If you are partway through learning full OLL, this is a good way to meet the cases you have
        not learned: solve normally, and when an unfamiliar one comes up, the app names it. Then go
        and drill that one in the trainer.
      </Note>
      <GuidedSolve method="cfop" />
      <p className="muted" style={{ marginTop: 16 }}>
        For an F2L pair that is not at the front-right, it will tell you how far to turn the whole
        cube first — the algorithms are all written for that one slot.
      </p>
    </>
  ),
};

export const GUIDED_LESSONS: Lesson[] = [beginner, cfop];
