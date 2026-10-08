import { useState } from 'preact/hooks';
import { MINUTES_PER_DAY, format12, format24, formatMilitary, parseTime } from '../engine/time';
import { Gauge } from './Track';

const DAY_LABELS = [0, 6, 12, 18, 24].map((hour) => ({ at: hour * 60, text: `${String(hour).padStart(2, '0')}00` }));

/** Military time also writes midnight as 2400. */
function parseMilitary(input: string): number | null {
  const s = input.trim();
  return s === '2400' || s === '24:00' ? 0 : parseTime(s);
}

export default function MilitaryTime() {
  const [standard, setStandard] = useState('');
  const [military, setMilitary] = useState('');
  const [minutes, setMinutes] = useState<number | null>(null);

  const fromStandard = (value: string) => {
    setStandard(value);
    const parsed = value.trim() === '' ? null : parseTime(value);
    setMinutes(parsed);
    setMilitary(parsed === null ? '' : formatMilitary(parsed));
  };
  const fromMilitary = (value: string) => {
    setMilitary(value);
    const parsed = value.trim() === '' ? null : parseMilitary(value);
    setMinutes(parsed);
    setStandard(parsed === null ? '' : format12(parsed));
  };

  return (
    <div class="tool converter military">
      <label>
        Standard time (12-hour)
        <input type="text" placeholder="5:30 PM" autocomplete="off" value={standard} onInput={(e) => fromStandard(e.currentTarget.value)} />
      </label>
      <span class="equals" aria-hidden="true">=</span>
      <label>
        Military time (24-hour)
        <input type="text" inputMode="numeric" placeholder="1730" autocomplete="off" value={military} onInput={(e) => fromMilitary(e.currentTarget.value)} />
      </label>
      <p class="hint" aria-live="polite">
        {minutes === null
          ? 'Type a time in either box. Add AM or PM to a standard time.'
          : `${format12(minutes)} = ${formatMilitary(minutes)} military time, or ${format24(minutes)} on a 24-hour clock.`}
      </p>
      <Gauge max={MINUTES_PER_DAY} step={60} value={minutes ?? 0} mark={minutes ?? undefined} labels={DAY_LABELS} />
    </div>
  );
}
