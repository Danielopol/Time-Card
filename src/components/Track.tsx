import { trackPercent, trackTicks, type TrackSegment, type TrackWindow } from '../engine/track';

/** Spacing of the faint hour lines behind a track, as a share of its width. */
function hourStep(window: TrackWindow): string {
  return `${(60 / (window.to - window.from)) * 100}%`;
}

/** The labelled time scale that sits above a column of tracks. */
export function Scale({ window }: { window: TrackWindow }) {
  return (
    <div class="scale" aria-hidden="true">
      {trackTicks(window).map((tick) => (
        <span key={tick.at} style={{ left: `${trackPercent(tick.at, window)}%` }}>
          {tick.label}
        </span>
      ))}
    </div>
  );
}

/** One day's worked stretches drawn on the scale. Decorative: the same times are in the inputs beside it. */
export function Bars({ window, segments }: { window: TrackWindow; segments: TrackSegment[] }) {
  return (
    <div class="track" aria-hidden="true" style={{ '--step': hourStep(window) }}>
      {segments.map((segment) => (
        <span
          key={segment.from}
          class={segment.premium ? 'premium' : undefined}
          style={{
            left: `${trackPercent(segment.from, window)}%`,
            width: `${trackPercent(segment.to, window) - trackPercent(segment.from, window)}%`,
          }}
        />
      ))}
    </div>
  );
}

interface GaugeProps {
  /** The value at the right-hand end. */
  max: number;
  /** Distance between the faint lines, in the same unit as `max`. */
  step: number;
  /** Length of the plain bar. */
  value: number;
  /** Length of the highlighted bar that follows it. */
  premium?: number;
  /** Where to draw the marker line, with the note shown beside it. */
  mark?: number;
  markLabel?: string;
  labels: { at: number; text: string }[];
}

/** A filled bar on a ruled scale, with an optional marker. Decorative, like `Bars`. */
export function Gauge({ max, step, value, premium = 0, mark, markLabel, labels }: GaugeProps) {
  const percent = (n: number) => `${Math.min(100, Math.max(0, (n / max) * 100))}%`;
  return (
    <div class="gauge" aria-hidden="true">
      <div class="gauge-bar" style={{ '--step': percent(step) }}>
        <span class="fill" style={{ width: percent(value) }} />
        {premium > 0 && <span class="fill premium" style={{ left: percent(value), width: percent(premium) }} />}
        {mark !== undefined && <span class="marker" style={{ left: percent(mark) }} />}
      </div>
      <div class="gauge-labels">
        {labels.map((label) => (
          <span key={label.at} style={{ left: percent(label.at) }} class={label.at === 0 ? 'first' : label.at === max ? 'last' : undefined}>
            {label.text}
          </span>
        ))}
      </div>
      {markLabel && <p class="gauge-note">{markLabel}</p>}
    </div>
  );
}
