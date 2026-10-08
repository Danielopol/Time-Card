import { useEffect, useState } from 'preact/hooks';
import { decimalHoursToMinutes, formatDecimalHours, formatHM, parseDuration } from '../engine/time';
import { Gauge } from './Track';

const RULER_LABELS = [
  { at: 0, text: '0' },
  { at: 15, text: '15 · .25' },
  { at: 30, text: '30 · .50' },
  { at: 45, text: '45 · .75' },
  { at: 60, text: '60' },
];

interface Props {
  /** Which field the page leads with. */
  direction: 'toDecimal' | 'toMinutes';
}

function parseDecimal(input: string): number | null {
  const s = input.trim();
  if (!/^\d*\.?\d+$|^\d+\.$/.test(s)) return null;
  return decimalHoursToMinutes(Number(s));
}

export default function Converter({ direction }: Props) {
  const [time, setTime] = useState('');
  const [decimal, setDecimal] = useState('');
  const [copied, setCopied] = useState(false);

  const fromTime = (value: string) => {
    setTime(value);
    const minutes = parseDuration(value);
    setDecimal(minutes === null ? '' : formatDecimalHours(minutes));
    setCopied(false);
  };
  const fromDecimal = (value: string) => {
    setDecimal(value);
    const minutes = parseDecimal(value);
    setTime(minutes === null ? '' : formatHM(minutes));
    setCopied(false);
  };

  const answer = direction === 'toDecimal' ? decimal : time;
  const copyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
    } catch {
      // Without clipboard access the answer is still in its box to select by hand.
    }
  };

  // The ruler shows the minutes past the hour, which is the part that turns into the decimals.
  const total = time === '' ? null : parseDuration(time);
  const past = total === null ? 0 : total % 60;

  // A chart row anchor such as #40-minutes fills the converter with that value.
  useEffect(() => {
    const fill = () => {
      const match = /^#(\d{1,2})-minutes$/.exec(location.hash);
      if (match) fromTime(match[1]);
    };
    fill();
    addEventListener('hashchange', fill);
    return () => removeEventListener('hashchange', fill);
  }, []);

  const timeField = (
    <label>
      Hours and minutes
      <input type="text" inputMode="text" placeholder="8:40 or 40" value={time} onInput={(e) => fromTime(e.currentTarget.value)} />
    </label>
  );
  const decimalField = (
    <label>
      Decimal hours
      <input type="text" inputMode="decimal" placeholder="8.67" value={decimal} onInput={(e) => fromDecimal(e.currentTarget.value)} />
    </label>
  );

  return (
    <div class="tool converter">
      {direction === 'toDecimal' ? timeField : decimalField}
      <span class="equals" aria-hidden="true">=</span>
      {direction === 'toDecimal' ? decimalField : timeField}
      <button type="button" class="secondary" onClick={copyAnswer} disabled={answer === ''}>
        {copied ? 'Copied' : 'Copy'}
      </button>
      <Gauge
        max={60}
        step={5}
        value={past}
        mark={past > 0 ? past : undefined}
        markLabel={past > 0 ? `${past} min = ${formatDecimalHours(past).replace(/^0/, '')} h` : undefined}
        labels={RULER_LABELS}
      />
    </div>
  );
}
