import { useEffect, useState } from 'preact/hooks';
import { decimalHoursToMinutes, formatDecimalHours, formatHM, parseDuration } from '../engine/time';

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

  const fromTime = (value: string) => {
    setTime(value);
    const minutes = parseDuration(value);
    setDecimal(minutes === null ? '' : formatDecimalHours(minutes));
  };
  const fromDecimal = (value: string) => {
    setDecimal(value);
    const minutes = parseDecimal(value);
    setTime(minutes === null ? '' : formatHM(minutes));
  };

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
    </div>
  );
}
