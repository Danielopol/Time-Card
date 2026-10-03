import { useState } from 'preact/hooks';
import { format12, formatDecimalHours, formatHM, minutesBetween, parseDuration, parsePunch, parseTime } from '../engine/time';

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? '' : 's'}`;
}

export default function HoursCalc() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [breakText, setBreakText] = useState('');

  const startTime = start.trim() === '' ? null : parseTime(start);
  // A bare end hour at or before the start is read as PM, so 9 to 5 means 5:00 PM.
  const endTime = end.trim() === '' ? null : parsePunch(end, startTime);
  const breakMinutes = breakText.trim() === '' ? 0 : parseDuration(breakText);

  const span = startTime !== null && endTime !== null ? minutesBetween(startTime, endTime) : null;
  const breakTooLong = span !== null && breakMinutes !== null && breakMinutes > span;
  const total = span !== null && breakMinutes !== null && !breakTooLong ? span - breakMinutes : null;
  const overnight = startTime !== null && endTime !== null && endTime < startTime;

  return (
    <div class="tool calc">
      <div class="fields">
        <label>
          Start time
          <input
            type="text"
            placeholder="9:00 AM"
            autocomplete="off"
            value={start}
            aria-invalid={start.trim() !== '' && startTime === null ? 'true' : undefined}
            onInput={(e) => setStart(e.currentTarget.value)}
            onBlur={() => startTime !== null && setStart(format12(startTime))}
          />
        </label>
        <label>
          End time
          <input
            type="text"
            placeholder="5:30 PM"
            autocomplete="off"
            value={end}
            aria-invalid={end.trim() !== '' && endTime === null ? 'true' : undefined}
            onInput={(e) => setEnd(e.currentTarget.value)}
            onBlur={() => endTime !== null && setEnd(format12(endTime))}
          />
        </label>
        <label>
          Break (optional)
          <input
            type="text"
            placeholder="30 or 0:30"
            autocomplete="off"
            value={breakText}
            aria-invalid={breakMinutes === null || breakTooLong ? 'true' : undefined}
            aria-describedby="hours-help"
            onInput={(e) => setBreakText(e.currentTarget.value)}
          />
        </label>
      </div>
      <p class="hint" id="hours-help">
        Type times as <kbd>9</kbd>, <kbd>830</kbd>, <kbd>8:30a</kbd>, <kbd>5p</kbd> or <kbd>17:30</kbd>. Enter the break in minutes, or as <kbd>0:45</kbd> or <kbd>1h</kbd>.
      </p>

      <div class="result" aria-live="polite">
        {total !== null ? (
          <>
            <p class="answer">
              <strong>
                {total >= 60 && total % 60 === 0
                  ? plural(total / 60, 'hour')
                  : `${plural(Math.floor(total / 60), 'hour')} ${plural(total % 60, 'minute')}`}
              </strong>
            </p>
            <dl>
              <div>
                <dt>Decimal hours</dt>
                <dd>{formatDecimalHours(total)}</dd>
              </div>
              <div>
                <dt>Hours:minutes</dt>
                <dd>{formatHM(total)}</dd>
              </div>
              <div>
                <dt>Total minutes</dt>
                <dd>{total}</dd>
              </div>
            </dl>
            <p class="hint">
              {format12(startTime!)} to {format12(endTime!)}
              {overnight && ' the next day'}
              {breakMinutes! > 0 && `, minus a ${formatHM(breakMinutes!)} break`}
            </p>
          </>
        ) : breakTooLong ? (
          <p class="hint">The break is longer than the time between the start and the end.</p>
        ) : (
          <p class="hint">Enter a start time and an end time.</p>
        )}
      </div>
    </div>
  );
}
