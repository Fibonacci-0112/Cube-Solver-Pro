import { Alg, AlgBox, Note, Steps } from '../components';
import type { Lesson } from './types';

const reduction: Lesson = {
  id: 'reduction',
  title: 'Big cubes — the reduction method',
  section: 'Big cubes',
  summary: 'Turn a 4x4 or 5x5 into a 3x3, then solve it as one.',
  minutes: 7,
  Body: () => (
    <>
      <p>
        A 4x4 looks like a different puzzle. It is not. Almost everyone solves big cubes by{' '}
        <strong>reduction</strong>: rearrange the pieces until the cube behaves exactly like a 3x3,
        then solve it with the method you already know.
      </p>

      <h3>The three phases</h3>
      <Steps
        items={[
          <>
            <strong>Centres.</strong> On a 3x3 the centre is one piece and cannot move. On a 4x4 each
            face has four centre pieces that <em>can</em> move, so first you gather each colour into
            a solid block. Six blocks, and now they behave like single centres.
          </>,
          <>
            <strong>Edges.</strong> Each 3x3 edge is two or three pieces on a big cube. Pair them up
            so each edge acts as one piece.
          </>,
          <>
            <strong>Solve it as a 3x3.</strong> Using only outer-layer turns, which keep your centre
            blocks and edge pairs together.
          </>,
        ]}
      />

      <Note title="The rule that keeps reduction intact">
        Once the centres and edges are built, only turn <em>outer</em> layers. An inner-layer turn
        (<Alg>Rw</Alg>, <Alg>Uw</Alg>) will split them apart again. The exception is parity, which is
        the next-but-one page.
      </Note>

      <h3>Centres first, and why it is the slow bit</h3>
      <p>
        Building centres is mostly intuitive and mostly unpleasant at first — there are no algorithms
        worth memorising, just the skill of moving a piece into a block without knocking out the ones
        already there. The usual trick is to hold the block you are building on the left, bring the
        piece you want to the top or right, and use one inner slice to insert it and the same slice
        back to restore what you disturbed.
      </p>
      <AlgBox
        label="The shape of nearly every centre move"
        alg="Rw  U  Rw'"
        note="Take a piece out, turn the top to bring the target round, put it back. Everything else in centres is a variation on this."
      />
      <p>
        On a 5x5 there is an extra wrinkle: each face has a fixed middle centre, like a 3x3, so the
        colour scheme is decided for you. On a 4x4 there is no fixed centre, so you have to work out
        the scheme from the corners: white opposite yellow, green opposite blue, red opposite orange,
        arranged so that white, green and red go clockwise round their shared corner.
      </p>
    </>
  ),
};

const pairing: Lesson = {
  id: 'edge-pairing',
  title: 'Big cubes — pairing the edges',
  section: 'Big cubes',
  summary: 'One slice, one turn, one slice back. Then the last two.',
  minutes: 7,
  Body: () => (
    <>
      <p>
        With centres built, the edges need pairing. On a 4x4 that is twelve pairs of two; on a 5x5,
        twelve groups of three with a fixed middle piece to build around.
      </p>

      <h3>The basic pairing move</h3>
      <p>
        Bring two matching edge pieces to the front-left and front-right, one in the top part of the
        edge and one in the bottom. Then:
      </p>
      <AlgBox label="Join a pair" alg="Uw'  R U R'  Uw" note="Or the mirror, Uw L' U' L Uw'." />
      <p>
        The slice takes the pair down out of the way, the trigger brings a fresh pair of pieces up,
        and the slice back restores the centres. Repeat until only two edges are left unpaired.
      </p>

      <Note title="Pair several at once">
        Once you are comfortable, do not slice back after every pair. Bring several pairs together
        while the centres are broken, then restore everything with one slice at the end. This is
        where most of the time saving on 4x4 lives.
      </Note>

      <h3>The last two edges</h3>
      <p>
        Eventually two edges remain and there is nowhere to bring a fresh pair from. Hold the two
        unpaired edges at the front-left and front-right and use:
      </p>
      <AlgBox label="Last two edges" alg="Dw  R  F'  U  R'  F  Dw'" />
      <p>
        If the two pieces are flipped relative to each other so they cannot simply be joined, that is
        edge parity, which the next page covers.
      </p>
      <p>
        From here, the cube is a 3x3. Solve it with whatever method you already use, remembering to
        turn only the outer layers.
      </p>
    </>
  ),
};

const parity: Lesson = {
  id: 'parity',
  title: 'Big cubes — parity',
  section: 'Big cubes',
  summary: 'The two positions that are impossible on a 3x3, and the algorithms that fix them.',
  minutes: 6,
  Body: () => (
    <>
      <p>
        Solve a 4x4 down to a 3x3 and sooner or later you will hit something that simply cannot happen
        on a real 3x3 — a single flipped edge, or two pieces that need swapping and nothing else. This
        is <strong>parity</strong>, and it is not a mistake you made.
      </p>

      <h3>Why it happens</h3>
      <p>
        On a 4x4 there is no fixed centre, so the cube cannot tell you whether you assembled it the
        "right way round". Two edge pieces that look identical are actually distinguishable to the
        puzzle, and you may have paired them the other way. Reduction hides that until the very end,
        when it shows up as a position a 3x3 could never reach. It happens on about half of all
        solves, so learn both algorithms and stop worrying about it.
      </p>

      <h3>OLL parity — one edge flipped</h3>
      <p>
        You reach the last layer and exactly one edge is flipped, which no OLL case covers. Hold the
        flipped edge at the front and run:
      </p>
      <AlgBox
        label="OLL parity (4x4)"
        alg="Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'"
        note="Long, but it is the standard one and it becomes muscle memory quickly."
      />

      <h3>PLL parity — two pieces swapped</h3>
      <p>
        Everything is oriented but two edges (or two corners) need swapping, which again no PLL
        covers. Hold the two edges that need swapping at the front and back of the right-hand face:
      </p>
      <AlgBox
        label="PLL parity (4x4)"
        alg="Rw2 U2 Rw2 Uw2 Rw2 Uw2"
        note="Short, and easy to remember as a rhythm: double everything."
      />

      <Note title="5x5 and 7x7 do not have this problem">
        Odd-sized cubes have fixed centres, so the ambiguity never arises. If you hit something that
        looks like parity on a 5x5, you have genuinely mis-paired an edge — go back and check.
        Even cubes (4x4, 6x6) have parity; odd ones do not.
      </Note>
      <p>
        Both parity cases can appear in the same solve. That is normal, and it is why 4x4 averages
        are less consistent than 3x3 ones.
      </p>
    </>
  ),
};

export const BIG_CUBE_LESSONS: Lesson[] = [reduction, pairing, parity];
