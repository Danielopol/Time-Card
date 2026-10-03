import { useState } from 'preact/hooks';
import { formatMoney, parseRateCents } from '../engine/money';
import { grossPayCents } from '../engine/overtime';
import { RULE_SETS, describeRules, type RuleSetId } from '../engine/rules/index';
import { formatDecimalHours, parseHours } from '../engine/time';

function parseMultiplier(input: string): number | null {
  const s = input.trim();
  if (!/^\d{1,2}(\.\d{0,2})?$/.test(s)) return null;
  const value = Number(s);
  return value >= 1 && value <= 10 ? value : null;
}

/** An empty hours field counts as zero. */
function hoursOrZero(input: string): number | null {
  return input.trim() === '' ? 0 : parseHours(input);
}

export default function OvertimeCalc() {
  const [rate, setRate] = useState('');
  const [regular, setRegular] = useState('40');
  const [overtime, setOvertime] = useState('');
  const [multiplier, setMultiplier] = useState('1.5');
  const [doubleTime, setDoubleTime] = useState('');
  const [ruleSet, setRuleSet] = useState<RuleSetId>('federal');

  const rateCents = parseRateCents(rate);
  const regularMinutes = hoursOrZero(regular);
  const overtimeMinutes = hoursOrZero(overtime);
  const doubleTimeMinutes = hoursOrZero(doubleTime);
  const overtimeMultiplier = parseMultiplier(multiplier);

  const ready =
    rateCents !== null && rateCents > 0 && regularMinutes !== null && overtimeMinutes !== null && doubleTimeMinutes !== null && overtimeMultiplier !== null;
  const pay = ready
    ? grossPayCents({ regular: regularMinutes, overtime: overtimeMinutes, doubleTime: doubleTimeMinutes }, rateCents, overtimeMultiplier)
    : null;
  const invalid = (bad: boolean) => (bad ? 'true' : undefined);

  return (
    <div class="tool calc">
      <div class="fields">
        <label>
          Hourly rate ($)
          <input type="text" inputMode="decimal" placeholder="18.50" autocomplete="off" value={rate} aria-invalid={invalid(rateCents === null)} onInput={(e) => setRate(e.currentTarget.value)} />
        </label>
        <label>
          Regular hours
          <input type="text" inputMode="decimal" placeholder="40" autocomplete="off" value={regular} aria-invalid={invalid(regularMinutes === null)} onInput={(e) => setRegular(e.currentTarget.value)} />
        </label>
        <label>
          Overtime hours
          <input type="text" inputMode="decimal" placeholder="5 or 5:30" autocomplete="off" value={overtime} aria-invalid={invalid(overtimeMinutes === null)} onInput={(e) => setOvertime(e.currentTarget.value)} />
        </label>
        <label>
          Overtime multiplier
          <input type="text" inputMode="decimal" placeholder="1.5" autocomplete="off" value={multiplier} aria-invalid={invalid(overtimeMultiplier === null)} onInput={(e) => setMultiplier(e.currentTarget.value)} />
        </label>
        <label>
          Double-time hours (optional)
          <input type="text" inputMode="decimal" placeholder="0" autocomplete="off" value={doubleTime} aria-invalid={invalid(doubleTimeMinutes === null)} onInput={(e) => setDoubleTime(e.currentTarget.value)} />
        </label>
      </div>
      <p class="hint">Enter hours as a decimal (<kbd>5.5</kbd>) or as hours and minutes (<kbd>5:30</kbd>).</p>

      <div class="result" aria-live="polite">
        {pay && ready ? (
          <>
            <p class="answer">
              <strong>Total pay {formatMoney(pay.total)}</strong>
            </p>
            <dl>
              <div>
                <dt>Regular pay</dt>
                <dd>{formatMoney(pay.regular)}</dd>
              </div>
              <div>
                <dt>Overtime pay</dt>
                <dd>{formatMoney(pay.overtime)}</dd>
              </div>
              {doubleTimeMinutes > 0 && (
                <div>
                  <dt>Double-time pay</dt>
                  <dd>{formatMoney(pay.doubleTime)}</dd>
                </div>
              )}
              <div>
                <dt>Overtime rate</dt>
                <dd>{formatMoney(Math.round(rateCents * overtimeMultiplier))} an hour</dd>
              </div>
              <div>
                <dt>Total hours</dt>
                <dd>{formatDecimalHours(regularMinutes + overtimeMinutes + doubleTimeMinutes)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p class="hint">Enter your hourly rate and hours.</p>
        )}
      </div>

      <div class="rules">
        <label>
          Which hours count as overtime?
          <select value={ruleSet} onChange={(e) => setRuleSet(e.currentTarget.value as RuleSetId)}>
            {Object.values(RULE_SETS).map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        <ul>
          {describeRules(RULE_SETS[ruleSet]).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p class="hint">
          Source:{' '}
          {RULE_SETS[ruleSet].sources.map((source, i) => (
            <>
              {i > 0 && '; '}
              <a href={source.url} rel="noopener">{source.label}</a>
            </>
          ))}
          . Last reviewed {RULE_SETS[ruleSet].lastReviewed}.
        </p>
      </div>
    </div>
  );
}
