import { Alg, AlgBox, CaseRow, CasePicture, Note, PractiseLink, Steps } from '../components';
import type { Lesson } from './types';

const cross: Lesson = {
  id: 'cfop-cross',
  title: 'CFOP 1 — An efficient cross',
  section: 'Learn to solve',
  summary: 'Six or seven moves, planned before you start turning.',
  minutes: 7,
  Body: () => (
    <>
      <p>
        Every cross can be done in eight moves or fewer, and most in six or seven. If yours takes
        fifteen, that is four or five seconds you are giving away on every single solve — more than
        you will ever save by learning another OLL.
      </p>

      <h3>Stop solving one edge at a time</h3>
      <p>
        The beginner instinct is: find an edge, place it, find the next. That is four separate
        problems and a lot of wasted turns. Instead, look at where all four white edges are{' '}
        <em>before you touch the cube</em>, and pick an order that lets them share moves.
      </p>
      <Steps
        items={[
          <>
            <strong>Solve on the bottom, always.</strong> Turning the cube over costs time and, worse,
            it stops you from tracking pieces.
          </>,
          <>
            <strong>Place the awkward one first.</strong> An edge that needs several moves should go
            in while the bottom is still empty and you can use any face freely.
          </>,
          <>
            <strong>Look for pairs.</strong> Two edges that both need the same face turned are one
            move, not two.
          </>,
        ]}
      />

      <h3>Planning it in inspection</h3>
      <p>
        This is the real goal, and it takes weeks rather than minutes. Start by finding{' '}
        <em>one</em> edge during inspection and tracking it through your first move. Then two. Most
        people can plan a whole cross within a couple of months of trying properly, and it is worth
        the frustration — a planned cross is a cross done at full speed with no pauses.
      </p>
      <Note title="A drill">
        Turn off the timer. Scramble, then give yourself as long as you need to plan the entire cross
        without moving anything. Then execute it with your eyes closed. If you get it, you planned it;
        if not, you were improvising.
      </Note>
    </>
  ),
};

const f2l: Lesson = {
  id: 'cfop-f2l',
  title: 'CFOP 2 — F2L, and why it is not memorisation',
  section: 'Learn to solve',
  summary: 'Insert a corner and its edge together. Four ideas cover most of the 41 cases.',
  minutes: 10,
  Body: () => (
    <>
      <p>
        F2L fills the four bottom-layer slots, each holding a corner and its matching edge. Instead of
        doing all the corners then all the edges, you pair each corner with its edge and put them in
        together. That is the step that turns a ninety-second solve into a forty-five-second one.
      </p>

      <h3>The whole idea in one sequence</h3>
      <p>
        Put a corner in the top layer directly above its slot, with the matching edge next to it, and
        the pair drops in with three moves.
      </p>
      <CaseRow>
        <CasePicture setId="f2l" caseId="f2l-3" caption="Pair ready, insert right" />
        <CasePicture setId="f2l" caseId="f2l-1" caption="Pair ready, insert front" />
      </CaseRow>
      <p>
        Everything else in F2L is getting to one of those. That is the honest summary: 41 cases, but
        only a handful of ideas.
      </p>

      <h3>The four ideas</h3>
      <Steps
        items={[
          <>
            <strong>Pair them in the top.</strong> Move the corner so it is above the slot, then turn
            the top to bring the edge beside it, then insert. Most cases are this.
          </>,
          <>
            <strong>Take it out first.</strong> If either piece is already stuck in a slot — wrong
            slot, or right slot the wrong way — get it out with <Alg>R U R'</Alg> or{' '}
            <Alg>R U' R'</Alg>, then treat it as a normal case.
          </>,
          <>
            <strong>Use both hands.</strong> The front-right slot is easy with <Alg>R</Alg> and{' '}
            <Alg>U</Alg>. The front-left slot is the mirror, with <Alg>L</Alg> and <Alg>U</Alg>, or
            turn the cube. Do not force everything into one slot.
          </>,
          <>
            <strong>Watch the edge, not the corner.</strong> The corner is easy to track because it
            has three colours. The edge is the one that gets lost.
          </>,
        ]}
      />

      <Note title="Learn it by doing, not by reading">
        F2L is the one part of CFOP that is genuinely better learned intuitively. Take a scrambled
        cube, solve the cross, then spend ten minutes putting one pair in — slowly, thinking about it,
        undoing when you get it wrong. Do that for a week and you will have worked out most of the 41
        cases yourself, and you will actually understand them.
      </Note>

      <p>
        The trainer has all 41 cases when you want to check your solutions against short ones, or drill
        the few that keep catching you out.
      </p>
      <PractiseLink>Drill F2L cases</PractiseLink>
    </>
  ),
};

const twoLookOll: Lesson = {
  id: 'cfop-2look-oll',
  title: 'CFOP 3 — Two-look OLL',
  section: 'Learn to solve',
  summary: 'Ten algorithms that do the job of fifty-seven.',
  minutes: 8,
  Body: () => (
    <>
      <p>
        Full OLL is 57 algorithms. Two-look OLL is 10, gets you most of the benefit, and is the
        sensible thing to learn first. You do the top in two stages: edges, then corners.
      </p>

      <h3>Stage one — the edges (3 algorithms)</h3>
      <p>Same three shapes as the beginner method, but with a proper algorithm for each.</p>
      <AlgBox label="Dot" alg="F R U R' U' F' f R U R' U' f'" note="Or just do the line algorithm twice." />
      <AlgBox label="Line (hold it left to right)" alg="F R U R' U' F'" />
      <AlgBox label="L shape (arms pointing left and back)" alg="f R U R' U' f'" />

      <h3>Stage two — the corners (7 algorithms)</h3>
      <p>
        With the cross done, there are seven possible corner cases. These are all real OLL cases, so
        learning them is not wasted when you move to full OLL later.
      </p>
      <CaseRow>
        <CasePicture setId="oll" caseId="oll-27" caption="Sune" />
        <CasePicture setId="oll" caseId="oll-26" caption="Antisune" />
        <CasePicture setId="oll" caseId="oll-21" caption="Double Sune" />
        <CasePicture setId="oll" caseId="oll-22" caption="Pi" />
      </CaseRow>
      <CaseRow>
        <CasePicture setId="oll" caseId="oll-23" caption="Headlights" />
        <CasePicture setId="oll" caseId="oll-24" caption="Chameleon" />
        <CasePicture setId="oll" caseId="oll-25" caption="Bowtie" />
      </CaseRow>
      <Note>
        Sune and Antisune are mirror images and come up constantly. Learn those two first; between
        them they cover a good share of the cases you will meet.
      </Note>
      <PractiseLink>Drill these seven in the trainer</PractiseLink>
    </>
  ),
};

const twoLookPll: Lesson = {
  id: 'cfop-2look-pll',
  title: 'CFOP 4 — Two-look PLL',
  section: 'Learn to solve',
  summary: 'Six algorithms: corners first, then edges.',
  minutes: 7,
  Body: () => (
    <>
      <p>
        Same trick as two-look OLL. Place the corners, then the edges — six algorithms instead of 21.
      </p>

      <h3>Stage one — corners (2 algorithms)</h3>
      <p>
        Either two corners need swapping side by side, or diagonally. Look for{' '}
        <strong>headlights</strong>: two corners on one side showing the same colour.
      </p>
      <CaseRow>
        <CasePicture setId="pll" caseId="pll-t" caption="Adjacent swap (T perm)" />
        <CasePicture setId="pll" caseId="pll-y" caption="Diagonal swap (Y perm)" />
      </CaseRow>
      <p>
        For the adjacent swap, hold the headlights on the <strong>left</strong>. If there are no
        headlights at all, it is the diagonal case.
      </p>

      <h3>Stage two — edges (4 algorithms)</h3>
      <p>
        With the corners placed, the edges are either a three-cycle or a pair of swaps.
      </p>
      <CaseRow>
        <CasePicture setId="pll" caseId="pll-ua" caption="Ua — three-cycle" />
        <CasePicture setId="pll" caseId="pll-ub" caption="Ub — the other way" />
        <CasePicture setId="pll" caseId="pll-h" caption="H — opposite swap" />
        <CasePicture setId="pll" caseId="pll-z" caption="Z — adjacent swap" />
      </CaseRow>
      <Note title="Recognising the U perms">
        Three edges cycle and one is already correct. Hold the solved edge at the back; then you are
        only deciding whether the remaining three go clockwise or anticlockwise.
      </Note>
      <PractiseLink>Drill the six two-look PLL cases</PractiseLink>
    </>
  ),
};

const fullOll: Lesson = {
  id: 'cfop-full-oll',
  title: 'CFOP 5 — Full OLL without burning out',
  section: 'Learn to solve',
  summary: 'How to actually get through 57 cases.',
  minutes: 6,
  Body: () => (
    <>
      <p>
        57 algorithms is the biggest single lump of memorisation in CFOP, and it is where most people
        stall. The trick is to stop treating it as 57 algorithms.
      </p>

      <h3>Learn by shape, not by number</h3>
      <p>
        The cases group by what the yellow stickers look like: dots, lines, crosses, squares, fish,
        L shapes, P shapes, W shapes, lightning bolts. Learn a whole shape group at a time. Within a
        group the cases look similar, which sounds harder but is actually the point — you learn the
        small thing that tells them apart, which is exactly what recognition is.
      </p>
      <Steps
        items={[
          <>Pick one group. Four to six cases.</>,
          <>Learn them together, in one sitting, until you can do each from the picture.</>,
          <>
            Drill only that group for a few days, mixed, so you are practising{' '}
            <em>telling them apart</em> rather than just executing.
          </>,
          <>Then add them into your normal solves before starting the next group.</>,
        ]}
      />

      <Note title="The rule that saves you">
        Do not learn a new case while you are still slow at recognising the last batch. Recognition is
        the hard part; execution is the easy part. The trainer tracks a time per case and comes back
        to the slow ones — let it tell you when you are ready.
      </Note>
      <p>
        Expect this to take months, not weeks, and expect your times to get{' '}
        <em>slightly worse</em> for a while as you pause to recognise new cases. That dip is normal
        and it does come back.
      </p>
      <PractiseLink>Drill OLL by shape group</PractiseLink>
    </>
  ),
};

const fullPll: Lesson = {
  id: 'cfop-full-pll',
  title: 'CFOP 6 — Full PLL and recognising it fast',
  section: 'Learn to solve',
  summary: '21 cases, and the trick to telling them apart at a glance.',
  minutes: 7,
  Body: () => (
    <>
      <p>
        PLL is the friendlier set: 21 cases, and they come up often enough that they stick. Most
        people learn full PLL before full OLL, and that is the right order — fewer algorithms, more
        time saved.
      </p>

      <h3>Recognise by the corners first</h3>
      <p>
        Every PLL falls into one of four groups, and you can tell which by looking at the corners
        alone:
      </p>
      <Steps
        items={[
          <>
            <strong>Corners already done</strong> — only edges move. Four cases: Ua, Ub, H, Z.
          </>,
          <>
            <strong>Corners only</strong> — edges already done. Three cases: Aa, Ab, E.
          </>,
          <>
            <strong>Two corners swap side by side</strong> — look for headlights, two matching
            colours on one face. Most of the set lives here.
          </>,
          <>
            <strong>Two corners swap diagonally</strong> — no headlights anywhere. Four cases: V, Y,
            Na, Nb.
          </>,
        ]}
      />
      <p>
        That one look cuts 21 cases down to a handful. Then the edges tell you which one within the
        group.
      </p>

      <h3>Learn them in this order</h3>
      <Steps
        items={[
          <>Ua, Ub, H, Z — the edge cases. Short, common, and they finish solves.</>,
          <>T, Ja, Jb, Ra, Rb, F — the workhorses.</>,
          <>Aa, Ab, E — corner cases.</>,
          <>Y, V, Na, Nb — the diagonal ones.</>,
          <>Ga, Gb, Gc, Gd — last. The G perms are the hardest to tell apart, so give them their own week.</>,
        ]}
      />
      <Note>
        The four G perms are the usual sticking point. They all look alike. The difference is which
        corner block lines up with which edge — spend the time on recognising them, not on the
        finger tricks.
      </Note>
      <PractiseLink>Drill PLL by recognition group</PractiseLink>
    </>
  ),
};

export const CFOP_LESSONS: Lesson[] = [cross, f2l, twoLookOll, twoLookPll, fullOll, fullPll];
