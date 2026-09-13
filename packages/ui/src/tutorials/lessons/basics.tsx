import { Alg, AlgBox, Note, PractiseLink, Steps } from '../components';
import type { Lesson } from './types';

const notation: Lesson = {
  id: 'notation',
  title: 'Notation and the parts of a cube',
  section: 'Learn to solve',
  summary: 'What R, U and F mean, and why the centres are the thing to trust.',
  minutes: 6,
  Body: () => (
    <>
      <p>
        Every guide, every algorithm and every scramble in this app is written in the same shorthand.
        Twenty minutes learning it saves you from ever having to decode an algorithm again.
      </p>

      <h3>Three kinds of piece</h3>
      <p>
        A 3x3 is not 26 little cubes that can go anywhere. It is three kinds of piece, and a piece
        never changes kind:
      </p>
      <Steps
        items={[
          <>
            <strong>Centres</strong> — six of them, one per face, each showing a single colour. They
            are attached to the core and <em>cannot move relative to each other</em>. This is the
            single most useful fact about the cube: the centre tells you what colour that face will
            end up being. White opposite yellow, green opposite blue, red opposite orange.
          </>,
          <>
            <strong>Edges</strong> — twelve pieces showing two colours. An edge belongs between the
            two centres matching its colours.
          </>,
          <>
            <strong>Corners</strong> — eight pieces showing three colours, belonging where those
            three centres meet.
          </>,
        ]}
      />
      <Note>
        A corner can never become an edge. When you are solving, you are not moving stickers around —
        you are moving whole pieces into the one place each of them fits.
      </Note>

      <h3>The six faces</h3>
      <p>
        Hold the cube still. The face towards you is <Alg>F</Alg> (front), away is <Alg>B</Alg>
        (back), and then <Alg>U</Alg> (up), <Alg>D</Alg> (down), <Alg>L</Alg> (left),{' '}
        <Alg>R</Alg> (right). A letter on its own means turn that face a quarter turn{' '}
        <em>clockwise, looking at that face from outside the cube</em>.
      </p>
      <Steps
        items={[
          <><Alg>R</Alg> — the right face, one quarter turn clockwise.</>,
          <><Alg>R'</Alg> — "R prime", the same turn anticlockwise.</>,
          <><Alg>R2</Alg> — a half turn. Direction does not matter.</>,
        ]}
      />
      <p>
        The catch that trips everyone up: "clockwise" is judged from the outside of{' '}
        <em>that face</em>. <Alg>L</Alg> looks anticlockwise from where you are sitting, because you
        are looking at the left face from behind it.
      </p>

      <h3>Wider turns, slices and rotations</h3>
      <Steps
        items={[
          <>
            <Alg>Rw</Alg> (also written <Alg>r</Alg>) turns the right face <em>and</em> the layer
            behind it, two layers together.
          </>,
          <>
            <Alg>M</Alg> is the slice between L and R, turning the same way as <Alg>L</Alg>.{' '}
            <Alg>E</Alg> is the slice between U and D, turning like <Alg>D</Alg>. <Alg>S</Alg> is
            between F and B, turning like <Alg>F</Alg>.
          </>,
          <>
            <Alg>x</Alg>, <Alg>y</Alg> and <Alg>z</Alg> turn the <em>whole cube</em> in your hands,
            following <Alg>R</Alg>, <Alg>U</Alg> and <Alg>F</Alg> respectively. Nothing is solved by
            a rotation; it just changes what you are looking at.
          </>,
        ]}
      />
      <AlgBox
        label="Read this out loud"
        alg="R U R' U'"
        note="Right clockwise, up clockwise, right anticlockwise, up anticlockwise. Do it six times from a solved cube and you will be back where you started."
      />
      <Note title="Try it">
        That last claim is worth checking, because it tells you something important: sequences of
        moves repeat. Every algorithm you will learn is a sequence chosen because of what it does
        when it comes back round.
      </Note>
    </>
  ),
};

const beginnerCross: Lesson = {
  id: 'beginner-cross',
  title: 'Step 1 — The white cross',
  section: 'Learn to solve',
  summary: 'Four edges, no algorithms. The step that teaches you to look at the cube.',
  minutes: 8,
  Body: () => (
    <>
      <p>
        Pick white to start with. You are going to make a white cross on the bottom — but with one
        condition that beginners often skip, and then wonder why nothing works afterwards.
      </p>

      <h3>The condition that matters</h3>
      <p>
        Each white edge has a second colour. That second colour must line up with its own centre.
        A white-and-red edge goes between the white centre and the <em>red</em> centre. Four white
        stickers in a cross shape is not enough; if the sides do not match, the cube is not
        actually ready for step two.
      </p>
      <Note title="Build it on the bottom">
        It is tempting to build the cross on top where you can see it, then turn the cube over.
        Resist. Learning to build it directly on the bottom is slower for about a week and then
        pays back forever — it is what eventually lets you plan the whole cross before you start
        the timer.
      </Note>

      <h3>The method</h3>
      <Steps
        items={[
          <>Find a white edge. It is somewhere — top layer, middle, or already on the bottom.</>,
          <>
            Get it into the top layer without wrecking anything you have already placed. Usually one
            turn of a side face does it.
          </>,
          <>
            Turn <Alg>U</Alg> until the edge sits directly above the centre matching its other
            colour.
          </>,
          <>
            Turn that face twice. The edge drops to the bottom, in place and the right way round.
          </>,
        ]}
      />
      <p>
        For example, if the white-and-red edge is in the top layer with red facing up, bring it above
        the red centre and do <Alg>F2</Alg> (if red is your front). If red is facing outwards instead
        of up, it needs a different route — turn it into position with something like{' '}
        <Alg>U R U'</Alg> first.
      </p>

      <h3>The one case worth naming</h3>
      <p>
        Sometimes an edge is already on the bottom but the wrong way round — white on the side
        instead of the bottom. Do not try to be clever: bring it up into the top layer with two turns
        of that face, then put it back properly.
      </p>
      <PractiseLink>Try it on a real scramble in the solve-along</PractiseLink>
    </>
  ),
};

const beginnerCorners: Lesson = {
  id: 'beginner-corners',
  title: 'Step 2 — The white corners',
  section: 'Learn to solve',
  summary: 'One short trigger, repeated, finishes the first layer.',
  minutes: 7,
  Body: () => (
    <>
      <p>
        The first layer is finished by putting the four white corners in. You only need one sequence,
        and you will use it for the rest of your cubing life.
      </p>
      <AlgBox label="The trigger" alg="R U R' U'" note="Often called 'sexy move'. Learn it until your hands do it without you." />

      <h3>How to use it</h3>
      <Steps
        items={[
          <>
            Find a white corner in the top layer. Look at its other two colours — they tell you which
            pair of centres it belongs between.
          </>,
          <>
            Turn <Alg>U</Alg> until the corner is directly <em>above</em> the gap it needs to drop
            into, with that gap at the front-right.
          </>,
          <>
            Now repeat <Alg>R U R' U'</Alg> until the corner drops in with white on the bottom.
            It will take one, three or five repetitions depending on how the corner is turned.
          </>,
        ]}
      />
      <Note title="Why repeating is safe">
        The trigger takes the corner out of the slot, spins it, and puts it back. Nothing else in
        the bottom layer permanently changes. So you can repeat it without fear — it cannot break the
        cross, and it cannot put the corner anywhere except back in that same slot.
      </Note>

      <h3>If the corner is stuck in the bottom already</h3>
      <p>
        A white corner sitting in the bottom layer but in the wrong place, or the right place the
        wrong way round, has to come out first. Put any top-layer corner above it and run the
        trigger once — the stuck corner pops into the top layer, and you can place it properly.
      </p>
      <p>
        When all four are in, the whole bottom layer is one colour and the side faces have a matching
        band along the bottom. That band is how you check you have not cheated.
      </p>
    </>
  ),
};

const beginnerMiddle: Lesson = {
  id: 'beginner-middle',
  title: 'Step 3 — The middle layer',
  section: 'Learn to solve',
  summary: 'Two mirror algorithms send an edge left or right.',
  minutes: 7,
  Body: () => (
    <>
      <p>
        Two layers down. The middle layer has four edges to place, and there are only two algorithms —
        one to send an edge right, and its mirror image to send it left.
      </p>
      <p>
        Turn the cube so the finished layer is on the <em>bottom</em>. Yellow is now on top.
      </p>

      <h3>Finding an edge to work with</h3>
      <p>
        Look in the top layer for an edge with <strong>no yellow on it</strong>. Yellow edges belong
        in the last layer, so they are not your problem yet. An edge with no yellow belongs in the
        middle.
      </p>
      <Steps
        items={[
          <>
            Turn <Alg>U</Alg> until the colour on the <em>side</em> of that edge matches the centre
            underneath it. You will see a short vertical line of matching colour.
          </>,
          <>
            Now look at the colour on <em>top</em> of the edge. That tells you which way it goes: if
            it matches the centre to the right, send it right; if it matches the centre to the left,
            send it left.
          </>,
        ]}
      />
      <AlgBox label="Send it to the right" alg="U R U' R' U' F' U F" />
      <AlgBox label="Send it to the left" alg="U' L' U L U F U' F'" />
      <Note>
        These are mirrors of each other. Look at them side by side: every <Alg>R</Alg> becomes an{' '}
        <Alg>L</Alg>, every <Alg>U</Alg> becomes a <Alg>U'</Alg>. If you can do one, you nearly know
        the other.
      </Note>

      <h3>When an edge is already in the middle but wrong</h3>
      <p>
        Same problem as before, same answer: get it out. Run either algorithm with any top edge to
        kick the stuck one up into the top layer, then place it properly. It costs a few seconds and
        saves a lot of staring.
      </p>
    </>
  ),
};

const beginnerYellowCross: Lesson = {
  id: 'beginner-yellow-cross',
  title: 'Step 4 — The yellow cross',
  section: 'Learn to solve',
  summary: 'One algorithm, applied up to three times, from three starting shapes.',
  minutes: 5,
  Body: () => (
    <>
      <p>
        Two layers are done and you never have to touch them again — at least, not permanently.
        Everything from here happens on the top.
      </p>
      <p>
        First job: get the four yellow edges facing up, making a yellow cross. Ignore the corners
        completely, and ignore whether the edges are in the right <em>places</em>. Only which way
        they face matters.
      </p>

      <AlgBox label="The only algorithm you need" alg="F R U R' U' F'" />

      <h3>Three shapes</h3>
      <Steps
        items={[
          <>
            <strong>A dot</strong> — no yellow edges facing up. Run the algorithm once and you get a
            line or an L.
          </>,
          <>
            <strong>A line</strong> — two yellow edges facing up, opposite each other. Hold the line
            running <em>left to right</em>, then run the algorithm. You get the cross.
          </>,
          <>
            <strong>An L</strong> — two yellow edges facing up, next to each other. Hold the L so its
            two arms point <em>up-left and up-back</em> (like a backwards L in the top-left corner),
            then run the algorithm. You get the cross.
          </>,
        ]}
      />
      <Note title="If it is not working">
        Nine times out of ten it is how you are holding it. The algorithm is right; the orientation
        is not. Turn the top layer so the shape sits exactly as described, and try again.
      </Note>
      <p>
        From a dot the sequence is: algorithm, then you have a line or L, hold it correctly, algorithm
        again. Worst case, three times.
      </p>
    </>
  ),
};

const beginnerOll: Lesson = {
  id: 'beginner-oll',
  title: 'Step 5 — Turning the top corners up',
  section: 'Learn to solve',
  summary: 'The same trigger from step 2, and the nerve to let the cube look broken.',
  minutes: 6,
  Body: () => (
    <>
      <p>
        The yellow cross is done. Now the four corners need to face up too. This step uses the same{' '}
        <Alg>R U R' U'</Alg> you already know, and it asks you to trust it while the cube looks
        completely wrecked.
      </p>

      <Steps
        items={[
          <>
            Hold the cube so an <em>unsolved</em> yellow corner is at the top-front-right.
          </>,
          <>
            Repeat <Alg>R U R' U'</Alg> until <em>that one corner</em> has yellow on top. Two or four
            repetitions.
          </>,
          <>
            Now turn <strong>only the top layer</strong> to bring the next unsolved corner to the
            top-front-right. Do not turn the whole cube, and do not fix anything else.
          </>,
          <>Repeat until all four are up. The cube comes back together on the last one.</>,
        ]}
      />

      <Note title="This is the scary bit">
        Halfway through, your first two layers will look destroyed. They are not. Because you only
        ever turn <Alg>U</Alg> between corners, everything underneath is being cycled through a state
        it will return from. The moment the last corner turns up, the layers snap back. Keep going —
        stopping in the middle to "fix" the bottom is the only way to actually break it.
      </Note>

      <p>
        When this finishes, the whole top face is yellow. The sides will be a mess, and that is the
        next two steps.
      </p>
    </>
  ),
};

const beginnerPll: Lesson = {
  id: 'beginner-pll',
  title: 'Step 6 — Putting the last layer in place',
  section: 'Learn to solve',
  summary: 'Corners first, then edges. The cube is solved at the end of this page.',
  minutes: 7,
  Body: () => (
    <>
      <p>
        The top is all yellow but the sides do not match. Two algorithms finish the cube: one cycles
        three corners, the other cycles three edges.
      </p>

      <h3>Corners first</h3>
      <p>
        Look at the top corners and find one that is already in the right place — its three colours
        match the three centres around it, even if it is turned the wrong way. There is always at
        least one, or all four are already right.
      </p>
      <AlgBox label="Cycle three corners" alg="U R U' L' U R' U' L" />
      <p>
        Hold the cube with the correct corner at the <strong>top-right-back</strong> and run the
        algorithm. It cycles the other three. Repeat if needed. If no corner is in the right place,
        run it once from anywhere and one will appear.
      </p>

      <h3>Then the edges</h3>
      <p>
        Now find a side that is already finished — a whole face of one colour. Hold that side at the{' '}
        <strong>back</strong> and cycle the remaining three edges.
      </p>
      <AlgBox label="Cycle three edges anticlockwise" alg="R U' R U R U R U' R' U' R2" />
      <AlgBox label="Cycle three edges clockwise" alg="R2 U R U R' U' R' U' R' U R'" />
      <p>
        If no side is finished, run either algorithm once and one will be. Then hold that side at the
        back and go again.
      </p>

      <Note title="That is a solved cube">
        You now have a complete method. It will get you a solve every time, and with practice it will
        get you somewhere around a minute or a minute and a half. When you want to go faster, the
        next page explains what changes.
      </Note>
      <PractiseLink>Do a full solve with the app watching over your shoulder</PractiseLink>
    </>
  ),
};

const beginnerToCfop: Lesson = {
  id: 'beginner-to-cfop',
  title: 'From beginner to CFOP',
  section: 'Learn to solve',
  summary: 'What actually changes, what it costs, and what to do first.',
  minutes: 5,
  Body: () => (
    <>
      <p>
        The beginner method solves the cube in about seven steps. CFOP — Cross, F2L, OLL, PLL — solves
        it in four, and it is what almost every fast cuber uses. The difference is not speed of
        turning. It is that each step does more.
      </p>

      <h3>What changes</h3>
      <Steps
        items={[
          <>
            <strong>Cross</strong> — the same white cross, but planned in advance and done in six or
            seven moves instead of twenty.
          </>,
          <>
            <strong>F2L</strong> — instead of "corners, then middle edges", you insert a corner{' '}
            <em>and</em> its edge together, four times. This is the single biggest saving, and most of
            it is intuition rather than memorisation.
          </>,
          <>
            <strong>OLL</strong> — the whole top face turned yellow in one algorithm instead of
            repeated triggers. 57 cases, or 10 if you learn the two-look version first.
          </>,
          <>
            <strong>PLL</strong> — the last layer placed in one algorithm. 21 cases, or 6 two-look.
          </>,
        ]}
      />

      <h3>The honest order to learn it in</h3>
      <p>
        Do not start with the 57 OLLs. The usual path, and the one that keeps people enjoying it:
      </p>
      <Steps
        items={[
          <>Learn F2L intuitively. This alone takes most people from 90 seconds to around 45.</>,
          <>Learn 2-look OLL (10 algorithms) and 2-look PLL (6 algorithms).</>,
          <>Work on the cross and on lookahead. This is where the next big chunk of time is.</>,
          <>Only then start on full PLL, then full OLL, a handful of cases at a time.</>,
        ]}
      />
      <Note>
        A common mistake is learning algorithms faster than you can use them. If you cannot yet do
        F2L without pausing, another OLL will not make you faster. Time your solves and look at
        where the seconds actually go.
      </Note>
      <PractiseLink>Set the trainer to 2-look OLL and PLL when you are ready</PractiseLink>
    </>
  ),
};

export const BASIC_LESSONS: Lesson[] = [
  notation,
  beginnerCross,
  beginnerCorners,
  beginnerMiddle,
  beginnerYellowCross,
  beginnerOll,
  beginnerPll,
  beginnerToCfop,
];
