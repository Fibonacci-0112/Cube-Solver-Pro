/**
 * Small pieces the lessons are written with. Case pictures are drawn from the
 * cube state the algorithm produces, so a lesson cannot show one thing and
 * teach another.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CubePerspective, LastLayerDiagram } from '../components/CubeDiagram';
import { ALG_SETS_BY_ID, buildDrill, pairFacelets } from '@cube/core';

export function Alg({ children }: { children: ReactNode }) {
  return <code className="mono lesson-alg">{children}</code>;
}

export function AlgBox({ label, alg, note }: { label?: string; alg: string; note?: string }) {
  return (
    <div className="lesson-algbox">
      {label && <div className="field-label">{label}</div>}
      <div className="mono lesson-algbox-text">{alg}</div>
      {note && <div className="muted lesson-algbox-note">{note}</div>}
    </div>
  );
}

export function Note({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="lesson-note">
      {title && <strong>{title}</strong>}
      {children}
    </aside>
  );
}

/** A single case, drawn and labelled, with its algorithm. */
export function CasePicture({
  setId,
  caseId,
  caption,
}: {
  setId: 'oll' | 'pll' | 'f2l';
  caseId: string;
  caption?: string;
}) {
  const set = ALG_SETS_BY_ID[setId];
  const algCase = set.cases.find((c) => c.id === caseId);
  if (!algCase) return null;
  const drill = buildDrill(algCase.algs[0], () => 0);
  return (
    <figure className="lesson-case">
      {setId === 'f2l' ? (
        <CubePerspective cube={drill.state} emphasis={pairFacelets(drill.cubie)} size={104} />
      ) : (
        <LastLayerDiagram
          cube={drill.cubie}
          mode={setId === 'oll' ? 'orientation' : 'permutation'}
          arrows={setId === 'pll'}
          cell={20}
        />
      )}
      <figcaption>
        <strong>{caption ?? algCase.name}</strong>
        <code className="mono">{algCase.algs[0]}</code>
      </figcaption>
    </figure>
  );
}

export function CaseRow({ children }: { children: ReactNode }) {
  return <div className="lesson-case-row">{children}</div>;
}

/** Sends the reader into the trainer, which is where the practice happens. */
export function PractiseLink({ children = 'Practise this in the trainer' }: { children?: ReactNode }) {
  return (
    <p>
      <Link className="lesson-cta" to="/trainer">
        {children} →
      </Link>
    </p>
  );
}

export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="lesson-steps">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}
