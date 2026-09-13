import { Alg, AlgBox, Note, Steps } from '../components';
import type { Lesson } from './types';

const lookahead: Lesson = {
  id: 'lookahead',
  title: 'Lookahead — how to stop pausing',
  section: 'Getting faster',
  summary: 'The single biggest thing between you and a faster time, and the drill that fixes it.',
  minutes: 8,
  Body: () => (
    <>
      <p>
        Film yourself solving. What you will see is not slow turning — it is stopping. A burst of
        fast moves, then a pause while you hunt for the next piece, then another burst. Add up those
        pauses and you have most of your solve time.
      </p>

      <h3>What lookahead actually is</h3>
      <p>
        It is doing one thing while looking at the next. While your hands are inserting an F2L pair,
        your eyes should already be finding the pieces for the following one. The turning is not the
        skill; the not-looking-at-your-hands is the skill.
      </p>

      <h3>The drill that works</h3>
      <Note title="Slow down to get faster">
        This is counter-intuitive enough that most people refuse to do it, which is why most people
        plateau.
      </Note>
      <Steps
        items={[
          <>
            Solve at roughly <strong>half your normal turning speed</strong>. Deliberately, smoothly,
            no bursts.
          </>,
          <>
            The rule: <strong>never stop turning</strong>. If you have to pause to find a piece, you
            were going too fast. Slow down further.
          </>,
          <>
            Do this for whole sessions, not a couple of solves. Your times will be worse. That is the
            point — you are practising the looking, not the turning.
          </>,
          <>
            After a week or two, speed back up. The pauses will have shrunk, because your eyes learned
            to work ahead of your hands.
          </>,
        ]}
      />

      <h3>Where to point your eyes</h3>
      <Steps
        items={[
          <>During the cross, find your first F2L pair.</>,
          <>During each F2L insertion, find the next pair.</>,
          <>During the last F2L pair, look at the top edges — you can often know your OLL before you get there.</>,
        ]}
      />
      <p>
        Tracking a corner is easier than tracking an edge, so if you can only follow one piece, follow
        the edge and trust yourself to find the corner.
      </p>
    </>
  ),
};

const fingerTricks: Lesson = {
  id: 'finger-tricks',
  title: 'Finger tricks and turning efficiently',
  section: 'Getting faster',
  summary: 'Push the cube with fingers, not wrists, and stop regripping.',
  minutes: 7,
  Body: () => (
    <>
      <p>
        Fast turning is not fast arm movement. It is small movements from individual fingers, with the
        cube barely moving in your hands.
      </p>

      <h3>The basic set</h3>
      <Steps
        items={[
          <><Alg>U</Alg> — left index finger pushes the top layer. <Alg>U'</Alg> — right index finger.</>,
          <><Alg>R</Alg> — right ring finger pushes up the right face. <Alg>R'</Alg> — right index finger pushes down.</>,
          <><Alg>F</Alg> — left thumb pushes up. <Alg>L</Alg> — left ring finger.</>,
          <><Alg>D</Alg> — either thumb, underneath.</>,
        ]}
      />
      <p>
        If you are turning <Alg>U</Alg> with your whole hand, you are giving away a tenth of a second
        every time, dozens of times a solve.
      </p>

      <h3>Triggers, not moves</h3>
      <p>
        Your hands should learn short sequences as single units, not as individual letters.{' '}
        <Alg>R U R'</Alg> is one motion. <Alg>R U R' U'</Alg> is one motion. When you learn an
        algorithm, break it into triggers you already own.
      </p>
      <AlgBox
        label="The T perm, broken into triggers"
        alg="R U R' U'   ·   R' F R2 U' R'   ·   U' R U R' F'"
        note="Three chunks, not fourteen letters."
      />

      <h3>Regripping is the hidden cost</h3>
      <p>
        Every time you shuffle the cube in your hands to reach the next move, you lose time. Two
        things reduce it: choosing algorithms that end where the next one starts, and using{' '}
        <Alg>D</Alg> moves and cube rotations deliberately rather than out of panic.
      </p>
      <Note>
        A good test: can you do your PLL algorithms without the cube leaving your fingertips? If the
        cube is rolling around in your palms, the algorithm is fighting you and a different one for
        the same case might suit your hands better.
      </Note>
    </>
  ),
};

const colourNeutral: Lesson = {
  id: 'colour-neutrality',
  title: 'Colour neutrality — worth it?',
  section: 'Getting faster',
  summary: 'An honest look at the cost and the benefit.',
  minutes: 6,
  Body: () => (
    <>
      <p>
        Most people learn to always start with the white cross. Colour neutral means starting on
        whichever colour gives the easiest cross for that scramble.
      </p>

      <h3>The benefit is real but modest</h3>
      <p>
        With six choices you can usually find a cross a move or two shorter, and more importantly one
        that leaves an easy first pair. The usual estimate is a second or two off an average solve at
        an intermediate level.
      </p>

      <h3>The cost is real too</h3>
      <p>
        Your recognition gets worse across the board for a while — every piece of intuition about
        where things go was built around one colour. Expect weeks of being slower, and expect it to
        be genuinely annoying.
      </p>

      <h3>A sensible middle</h3>
      <Note title="Dual colour neutrality">
        Learn white <em>and</em> yellow. You keep most of your existing intuition, since the cross
        pieces are the same shape of problem, but you get two choices per scramble instead of one.
        Many fast cubers stop here and do fine.
      </Note>
      <Steps
        items={[
          <>
            <strong>Under a minute?</strong> Do not bother yet. Lookahead and F2L will give you far
            more.
          </>,
          <>
            <strong>Around 25 to 40 seconds?</strong> A good time to try dual, if you want to.
          </>,
          <>
            <strong>Already fast and plateaued?</strong> Full colour neutrality is one of the few
            remaining levers, and you have the base to absorb the dip.
          </>,
        ]}
      />
    </>
  ),
};

const inspection: Lesson = {
  id: 'inspection',
  title: 'Using the fifteen seconds',
  section: 'Getting faster',
  summary: 'Plan the whole cross, then go looking for the first pair.',
  minutes: 6,
  Body: () => (
    <>
      <p>
        Competition gives you fifteen seconds to look at the cube before you start. Used well, that is
        the cheapest few seconds you will ever save — the cross comes out at full speed with no
        thinking at all.
      </p>

      <h3>Build up in stages</h3>
      <Steps
        items={[
          <>
            <strong>Find one edge</strong> and know how you will place it. That alone removes the
            opening stumble.
          </>,
          <>
            <strong>Two edges.</strong> Now you have to hold the first solution in your head while
            finding the second, which is the actual skill.
          </>,
          <>
            <strong>All four.</strong> Slow at first — take thirty seconds if you need to, then work
            it down.
          </>,
          <>
            <strong>Cross plus the first pair's location.</strong> You do not need to plan the
            insertion, just know where those two pieces are so you are not hunting.
          </>,
        ]}
      />

      <Note title="Turn inspection on in Settings">
        Practising with the countdown running is different from practising without it. The app adds
        the competition penalties too — two seconds if you go over fifteen, DNF past seventeen — so
        the pressure is the same as it would be on the day.
      </Note>

      <h3>A memory trick</h3>
      <p>
        Do not memorise four separate move sequences. Memorise the <em>order</em> and one or two
        landmarks: "green edge is on the bottom already, red one is in the back-left, do those two
        together, then the blue from the top." Your hands will fill in the details.
      </p>
    </>
  ),
};

const readingStats: Lesson = {
  id: 'reading-your-stats',
  title: 'Reading your own statistics',
  section: 'Getting faster',
  summary: 'What best, ao12 and ao100 each tell you, and which to care about.',
  minutes: 6,
  Body: () => (
    <>
      <p>
        The numbers on the statistics page are not all measuring the same thing, and choosing the
        wrong one to chase will send you in the wrong direction.
      </p>

      <h3>What each one means</h3>
      <Steps
        items={[
          <>
            <strong>Best single.</strong> Mostly a measure of luck. A short scramble with an easy
            cross and a skipped OLL will beat your ability by a wide margin. Enjoy it; do not
            train for it.
          </>,
          <>
            <strong>ao5.</strong> Noisy, but it is what competitions use. Good for a session goal.
          </>,
          <>
            <strong>ao12.</strong> The best single number for "how am I doing today". Long enough to
            wash out one lucky scramble, short enough to respond to how you are actually solving.
          </>,
          <>
            <strong>ao100.</strong> The honest one. This is your real speed. It moves slowly, which
            is exactly why it is trustworthy — it cannot be flattered by a good run.
          </>,
        ]}
      />

      <Note title="The gap tells you something">
        Compare your best single with your ao100. A very large gap usually means inconsistency:
        occasional disasters, long pauses, or a step you sometimes get wrong. Closing that gap is
        often easier than raising the ceiling.
      </Note>

      <h3>Use the spread, not just the average</h3>
      <p>
        The distribution chart shows where your times actually land. A long tail to the right — a few
        solves far slower than the rest — is the clearest signal you will get. Those are not bad luck;
        they are a specific thing going wrong. Add a note to those solves when they happen and you
        will see the pattern within a week.
      </p>
      <p>
        Tap any solve in the list to write on it. "Lost the second pair" or "forgot the G perm" is
        worth more than any amount of staring at an average.
      </p>
    </>
  ),
};

const routine: Lesson = {
  id: 'practice-routine',
  title: 'Building a practice routine',
  section: 'Getting faster',
  summary: 'What to do with half an hour, so it is not all untimed solves.',
  minutes: 5,
  Body: () => (
    <>
      <p>
        Doing solves is not the same as practising. Solves tell you where you are; practice is what
        moves you. A useful session has both.
      </p>

      <h3>A half hour that works</h3>
      <Steps
        items={[
          <>
            <strong>5 minutes — warm up.</strong> Untimed solves, no pressure, get your hands moving.
          </>,
          <>
            <strong>10 minutes — drill one thing.</strong> The trainer, on whichever set you are
            learning. Or cross practice: scramble, plan the cross in inspection, execute, repeat.
          </>,
          <>
            <strong>10 minutes — timed solves.</strong> A proper ao12. This is your measurement.
          </>,
          <>
            <strong>5 minutes — slow solves.</strong> Half speed, no pauses, lookahead practice.
            Finish on this rather than starting on it.
          </>,
        ]}
      />

      <h3>Pick one thing at a time</h3>
      <p>
        Working on cross, lookahead, and twenty new OLLs at once means doing all three badly. Choose
        one for a fortnight. Let the statistics tell you when it has landed, then choose the next.
      </p>
      <Note>
        Sessions are separate in this app for exactly this reason. Keep a session for timed solves
        and another for experiments, so learning a new algorithm set does not pollute the average you
        are tracking.
      </Note>
    </>
  ),
};

const hardware: Lesson = {
  id: 'hardware',
  title: 'Choosing and setting up a cube',
  section: 'Getting faster',
  summary: 'What actually matters, and what does not.',
  minutes: 6,
  Body: () => (
    <>
      <p>
        A modern speedcube is genuinely better than the one in the back of a drawer, and the
        difference is worth a few seconds. Past that first upgrade, returns drop off fast.
      </p>

      <h3>What matters</h3>
      <Steps
        items={[
          <>
            <strong>It should corner-cut.</strong> A good cube turns even when the layer is not lined
            up perfectly. Without that, fast turning locks up constantly.
          </>,
          <>
            <strong>Magnets.</strong> Almost every current speedcube has them. They give each turn a
            definite stopping point, which makes turning more accurate with less care.
          </>,
          <>
            <strong>Tensions.</strong> Looser turns faster but pops and overshoots; tighter is more
            controlled but stiffer. Most cubes adjust without tools now. Change one thing, do twenty
            solves, then decide.
          </>,
          <>
            <strong>Lubricant.</strong> A thick lube in the core slows and smooths; a thin one on the
            pieces speeds things up. A drop or two, not a puddle.
          </>,
        ]}
      />

      <h3>What does not</h3>
      <p>
        The brand, past a point. Any well-reviewed magnetic cube from the last few years will take
        you well under twenty seconds. If your times are above thirty, the cube is not what is
        stopping you.
      </p>
      <Note title="Stickers or plastic">
        Stickerless cubes use coloured plastic, so nothing peels or fades, and most people find them
        slightly easier to recognise colours on. Competition allows both. It is preference, not
        performance.
      </Note>
      <p>
        One cube you like, set up how you like it, beats a drawer of cubes you keep swapping between.
        Consistency of feel is worth more than the last five percent of smoothness.
      </p>
    </>
  ),
};

export const IMPROVING_LESSONS: Lesson[] = [
  lookahead,
  fingerTricks,
  colourNeutral,
  inspection,
  readingStats,
  routine,
  hardware,
];
