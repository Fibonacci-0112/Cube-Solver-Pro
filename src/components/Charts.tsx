/**
 * Charts for the statistics page.
 *
 * Colours come from a palette validated for colour-vision deficiency and
 * contrast in both themes; series are read from CSS custom properties so the
 * dark-mode steps are the ones chosen for the dark surface. Identity is never
 * carried by colour alone: every series is both in the legend and labelled at
 * the end of its own line, and the solve table below the charts is the
 * text-based view of the same numbers.
 */

import { useMemo, useRef, useState } from 'react';
import { effectiveMs, formatTime, rollingAverages, type Solve } from '../stats/solves';

const WIDTH = 800;
const HEIGHT = 300;
const PAD = { top: 16, right: 68, bottom: 28, left: 52 };

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;

interface Series {
  name: string;
  colour: string;
  points: (number | null)[];
  /**
   * What a gap in this series means. For singles it is a DNF; for a rolling
   * average it only means there are not enough solves behind it yet.
   */
  gapMeans: 'dnf' | 'not yet';
}

/** Rounded "nice" tick values, so the axis reads in whole tenths or seconds. */
function ticksFor(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [min];
  const raw = (max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? magnitude * 10;
  const first = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let value = first; value <= max + step / 2; value += step) out.push(value);
  return out;
}

export function TrendChart({ solves }: { solves: Solve[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const series = useMemo<Series[]>(() => {
    const singles = solves.map((s) => effectiveMs(s));
    return [
      { name: 'single', colour: 'var(--series-1)', points: singles, gapMeans: 'dnf' },
      {
        name: 'ao5',
        colour: 'var(--series-2)',
        points: rollingAverages(solves, 5),
        gapMeans: 'not yet',
      },
      {
        name: 'ao12',
        colour: 'var(--series-3)',
        points: rollingAverages(solves, 12),
        gapMeans: 'not yet',
      },
    ];
  }, [solves]);

  const values = series.flatMap((s) => s.points).filter((v): v is number => v !== null);
  if (solves.length < 2 || values.length === 0) {
    return <div className="empty">A trend line appears once you have a few solves.</div>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const low = min - span * 0.08;
  const high = max + span * 0.08;

  const x = (i: number) => PAD.left + (solves.length === 1 ? 0 : (i / (solves.length - 1)) * plotWidth);
  const y = (ms: number) => PAD.top + plotHeight - ((ms - low) / (high - low)) * plotHeight;

  /** Breaks the line at DNFs rather than drawing through them. */
  const pathFor = (points: (number | null)[]): string => {
    let d = '';
    let open = false;
    points.forEach((value, i) => {
      if (value === null) {
        open = false;
        return;
      }
      d += `${open ? 'L' : 'M'}${x(i).toFixed(1)} ${y(value).toFixed(1)} `;
      open = true;
    });
    return d.trim();
  };

  const onMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const local = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (local - PAD.left) / plotWidth;
    const index = Math.round(ratio * (solves.length - 1));
    setHover(index >= 0 && index < solves.length ? index : null);
  };

  const lastOf = (points: (number | null)[]) => {
    for (let i = points.length - 1; i >= 0; i--) if (points[i] !== null) return { i, value: points[i]! };
    return null;
  };

  /**
   * Where each direct label sits. Lines that finish close together would
   * otherwise print their labels on top of each other, so anything closer than
   * a line height is nudged down the stack.
   */
  const labelPositions = (() => {
    const minGap = 13;
    const placed = series
      .map((s) => {
        const last = lastOf(s.points);
        return last ? { name: s.name, y: y(last.value) } : null;
      })
      .filter((entry): entry is { name: string; y: number } => entry !== null)
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < placed.length; i++) {
      if (placed[i].y - placed[i - 1].y < minGap) placed[i].y = placed[i - 1].y + minGap;
    }
    return placed;
  })();

  return (
    <figure className="chart">
      <figcaption className="chart-head">
        <h3>Times over the session</h3>
        <div className="legend">
          {series.map((s) => (
            <span className="legend-item" key={s.name}>
              <span className="legend-swatch" style={{ background: s.colour }} />
              {s.name}
            </span>
          ))}
        </div>
      </figcaption>

      <div className="chart-body">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="chart-svg"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label="Solve times, with rolling averages of 5 and 12"
        >
          {ticksFor(low, high).map((value) => (
            <g key={value}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y(value)}
                y2={y(value)}
                className="chart-grid"
              />
              <text x={PAD.left - 8} y={y(value) + 4} className="chart-tick" textAnchor="end">
                {formatTime(value)}
              </text>
            </g>
          ))}

          {hover !== null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + plotHeight}
              className="chart-crosshair"
            />
          )}

          {series.map((s) => (
            <path key={s.name} d={pathFor(s.points)} fill="none" stroke={s.colour} strokeWidth={2} />
          ))}

          {/* Direct labels, so the lines are identified without the legend. */}
          {labelPositions.map((label) => (
            <text
              key={`${label.name}-label`}
              x={WIDTH - PAD.right + 8}
              y={label.y + 4}
              className="chart-series-label"
            >
              {label.name}
            </text>
          ))}

          {hover !== null &&
            series.map((s) =>
              s.points[hover] === null ? null : (
                <circle
                  key={`${s.name}-dot`}
                  cx={x(hover)}
                  cy={y(s.points[hover]!)}
                  r={4.5}
                  fill={s.colour}
                  className="chart-dot"
                />
              ),
            )}

          <text x={PAD.left} y={HEIGHT - 8} className="chart-tick">1</text>
          <text x={WIDTH - PAD.right} y={HEIGHT - 8} className="chart-tick" textAnchor="end">
            {solves.length}
          </text>
        </svg>

        {hover !== null && (
          <div
            className="chart-tooltip"
            style={{ left: `${((x(hover) / WIDTH) * 100).toFixed(2)}%` }}
          >
            <div className="chart-tooltip-title">Solve {hover + 1}</div>
            {series.map((s) => (
              <div className="chart-tooltip-row" key={s.name}>
                <span className="legend-swatch" style={{ background: s.colour }} />
                <span>{s.name}</span>
                <span className="mono">
                  {s.points[hover] !== null
                    ? formatTime(s.points[hover]!)
                    : s.gapMeans === 'dnf'
                      ? 'DNF'
                      : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}

export function DistributionChart({ solves }: { solves: Solve[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const bins = useMemo(() => {
    const times = solves.map(effectiveMs).filter((v): v is number => v !== null);
    if (times.length < 5) return null;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const count = Math.min(14, Math.max(5, Math.round(Math.sqrt(times.length))));
    const width = (max - min) / count || 1;
    const buckets = Array.from({ length: count }, (_, i) => ({
      from: min + i * width,
      to: min + (i + 1) * width,
      count: 0,
    }));
    for (const time of times) {
      const index = Math.min(count - 1, Math.floor((time - min) / width));
      buckets[index].count += 1;
    }
    return buckets;
  }, [solves]);

  if (!bins) return <div className="empty">A distribution appears once you have five solves.</div>;

  const tallest = Math.max(...bins.map((b) => b.count));
  // Take the axis up to the highest tick, so a tick can never land above the plot.
  const axisTicks = ticksFor(0, tallest, 3);
  const axisTop = Math.max(tallest, ...axisTicks);
  const slot = plotWidth / bins.length;
  const barWidth = slot - 2; // 2px surface gap between neighbouring bars

  /** A bar with its top corners rounded and its foot flat on the baseline. */
  const barPath = (x: number, y: number, w: number, h: number): string => {
    const r = Math.min(4, w / 2, h);
    const bottom = y + h;
    return (
      `M${x} ${bottom} L${x} ${y + r} Q${x} ${y} ${x + r} ${y} ` +
      `L${x + w - r} ${y} Q${x + w} ${y} ${x + w} ${y + r} L${x + w} ${bottom} Z`
    );
  };

  return (
    <figure className="chart">
      <figcaption className="chart-head">
        <h3>How your times are spread</h3>
        <span className="muted">{bins.length} bands</span>
      </figcaption>
      <div className="chart-body">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="chart-svg"
          role="img"
          aria-label="Distribution of solve times"
        >
          {axisTicks.map((value) => (
            <g key={value}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={PAD.top + plotHeight - (value / axisTop) * plotHeight}
                y2={PAD.top + plotHeight - (value / axisTop) * plotHeight}
                className="chart-grid"
              />
              <text
                x={PAD.left - 8}
                y={PAD.top + plotHeight - (value / axisTop) * plotHeight + 4}
                className="chart-tick"
                textAnchor="end"
              >
                {Math.round(value)}
              </text>
            </g>
          ))}

          {bins.map((bin, i) => {
            const height = (bin.count / axisTop) * plotHeight;
            return (
              <path
                key={i}
                d={barPath(PAD.left + i * slot + 1, PAD.top + plotHeight - height, barWidth, height)}
                fill="var(--series-1)"
                opacity={hover === null || hover === i ? 1 : 0.55}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}

          <text x={PAD.left} y={HEIGHT - 8} className="chart-tick">
            {formatTime(bins[0].from)}
          </text>
          <text x={WIDTH - PAD.right} y={HEIGHT - 8} className="chart-tick" textAnchor="end">
            {formatTime(bins[bins.length - 1].to)}
          </text>
        </svg>

        {hover !== null && (
          <div
            className="chart-tooltip"
            style={{ left: `${(((PAD.left + hover * slot + slot / 2) / WIDTH) * 100).toFixed(2)}%` }}
          >
            <div className="chart-tooltip-title">
              {formatTime(bins[hover].from)} – {formatTime(bins[hover].to)}
            </div>
            <div className="chart-tooltip-row">
              <span>{bins[hover].count} solve{bins[hover].count === 1 ? '' : 's'}</span>
            </div>
          </div>
        )}
      </div>
    </figure>
  );
}
