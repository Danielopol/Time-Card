import { Fragment } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { cardToCSV } from '../engine/export';
import { mealBreakFlags } from '../engine/meals';
import { formatMoney, parseRateCents } from '../engine/money';
import { ROUNDING_INCREMENTS, type RoundingIncrement } from '../engine/round';
import { RULE_SETS, ruleSetFromQuery, type RuleSetId } from '../engine/rules/index';
import { cardFromFragment, cardToFragment } from '../engine/share';
import { computeCard, dayTimeline, emptyCard, parseCard, type DayPunches, type TimeCard as Card } from '../engine/timecard';
import { format12, formatDecimalHours, formatHM, parsePunch } from '../engine/time';
import { daySegments, trackWindow } from '../engine/track';
import { Bars, Gauge, Scale } from './Track';

const CURRENT_KEY = 'cardtime:current';
const SAVED_KEY = 'cardtime:saved';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EMPTY_HOURS = '--.--';
const PUNCH_FIELDS = ['in', 'lunchOut', 'lunchIn', 'out'] as const;
const PUNCH_LABELS = ['In', 'Lunch out', 'Lunch in', 'Out'];
const ROUNDING_LABELS: Record<RoundingIncrement, string> = {
  0: 'Exact minutes',
  5: 'Nearest 5 minutes',
  6: 'Nearest 6 minutes (tenth of an hour)',
  15: 'Nearest 15 minutes (7-minute rule)',
};
/** How each rounding choice reads inside the one-line summary of the settings. */
const ROUNDING_PHRASES: Record<RoundingIncrement, string> = {
  0: 'exact minutes',
  5: 'times rounded to 5 minutes',
  6: 'times rounded to 6 minutes',
  15: 'times rounded to 15 minutes',
};

/** What the form holds: the card's settings plus the raw text of every punch cell. */
interface FormState {
  name: string;
  rate: string;
  ruleSet: RuleSetId;
  rounding: RoundingIncrement;
  weekStart: number;
  texts: string[][];
}

function emptyRow(): string[] {
  return ['', '', '', ''];
}

function formFromCard(card: Card): FormState {
  return {
    name: card.name,
    rate: card.rateCents > 0 ? (card.rateCents / 100).toFixed(2) : '',
    ruleSet: card.ruleSet,
    rounding: card.rounding,
    weekStart: card.weekStart,
    texts: card.days.map((day) => PUNCH_FIELDS.map((field) => (day[field] === null ? '' : format12(day[field]!)))),
  };
}

/** Parse each row left to right, so a bare `5` after a `9` is read as 5 PM. */
function parseRows(texts: string[][]): { days: DayPunches[]; invalid: boolean[][] } {
  const invalid: boolean[][] = [];
  const days = texts.map((row) => {
    let previous: number | null = null;
    const rowInvalid: boolean[] = [];
    const values = row.map((text) => {
      if (text.trim() === '') {
        rowInvalid.push(false);
        return null;
      }
      const value = parsePunch(text, previous);
      rowInvalid.push(value === null);
      if (value !== null) previous = value;
      return value;
    });
    invalid.push(rowInvalid);
    return { in: values[0], lunchOut: values[1], lunchIn: values[2], out: values[3] };
  });
  return { days, invalid };
}

function readStorage(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked. The card still works for this visit.
  }
}

function readSavedCards(): Card[] {
  const data = readStorage(SAVED_KEY);
  if (!Array.isArray(data)) return [];
  return data.map(parseCard).filter((card): card is Card => card !== null);
}

function hours(minutes: number): string {
  return minutes === 0 ? '0.00' : `${formatDecimalHours(minutes)} (${formatHM(minutes)})`;
}

export default function TimeCard() {
  const [form, setForm] = useState<FormState>(() => formFromCard(emptyCard()));
  const [saved, setSaved] = useState<Card[]>([]);
  // A card opened from a share link is read-only until the visitor makes a copy.
  const [shared, setShared] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [blank, setBlank] = useState(false);
  const [status, setStatus] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  // On a phone the settings fold into one sentence until the visitor opens them.
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { days, invalid } = useMemo(() => parseRows(form.texts), [form.texts]);
  const rateCents = parseRateCents(form.rate);
  const card: Card = useMemo(
    () => ({
      v: 1,
      name: form.name,
      rateCents: rateCents ?? 0,
      ruleSet: form.ruleSet,
      rounding: form.rounding,
      weekStart: form.weekStart,
      days,
    }),
    [form.name, rateCents, form.ruleSet, form.rounding, form.weekStart, days],
  );
  const result = useMemo(() => computeCard(card), [card]);
  const rules = RULE_SETS[form.ruleSet];
  const biweekly = form.texts.length === 14;
  const hasDoubleTime = 'dailyDoubleTimeAfter' in rules;
  const mealFlags = useMemo(() => days.map((day) => ('mealBreaks' in rules ? mealBreakFlags(day, rules.mealBreaks) : [])), [days, rules]);
  const hasMealFlags = mealFlags.some((flags) => flags.length > 0);
  const timelines = useMemo(() => days.map((day) => dayTimeline(day, form.rounding)), [days, form.rounding]);
  const scaleWindow = useMemo(() => trackWindow(timelines), [timelines]);

  useEffect(() => {
    const fromLink = cardFromFragment(location.hash);
    if (fromLink) {
      setForm(formFromCard(fromLink));
      setShared(true);
    } else {
      // A state page links here with ?rules=california, which picks that rule set.
      const rules = ruleSetFromQuery(location.search);
      const current = parseCard(readStorage(CURRENT_KEY));
      if (current) setForm({ ...formFromCard(current), ...(rules ? { ruleSet: rules } : {}) });
      else if (rules) setForm((f) => ({ ...f, ruleSet: rules }));
    }
    setSaved(readSavedCards());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && !shared) writeStorage(CURRENT_KEY, card);
  }, [loaded, shared, card]);

  // The blank card prints once the empty grid has rendered.
  useEffect(() => {
    if (!blank) return;
    window.print();
    setBlank(false);
  }, [blank]);

  const update = (patch: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...patch }));
    setStatus('');
    setShareUrl('');
  };

  const setCell = (row: number, col: number, text: string) => {
    update({ texts: form.texts.map((r, i) => (i === row ? r.map((c, j) => (j === col ? text : c)) : r)) });
  };

  // Leaving a cell rewrites it as the time it was read as, e.g. `5` becomes `5:00 PM`.
  const normalizeCell = (row: number, col: number) => {
    const value = days[row][PUNCH_FIELDS[col]];
    if (value !== null && form.texts[row][col] !== format12(value)) setCell(row, col, format12(value));
  };

  const setBiweekly = (on: boolean) => {
    update({ texts: on ? [...form.texts, ...Array.from({ length: 7 }, emptyRow)] : form.texts.slice(0, 7) });
  };

  const dayLabels = form.texts.map((_, i) => DAY_NAMES[(form.weekStart + i) % 7]);

  const copyLink = async () => {
    const url = location.origin + location.pathname + cardToFragment(card);
    try {
      await navigator.clipboard.writeText(url);
      setStatus('Link copied. Anyone with the link can view this time card.');
    } catch {
      setStatus('Copy this link to share the time card:');
      setShareUrl(url);
    }
  };

  const downloadCSV = () => {
    const labels = dayLabels.map((label, i) => (biweekly ? `Week ${i < 7 ? 1 : 2} ${label}` : label));
    const blob = new Blob([cardToCSV(card, labels)], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${form.name.trim().replace(/[^\w-]+/g, '-') || 'time-card'}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const totalText = `${formatDecimalHours(result.totalMinutes)} hours (${formatHM(result.totalMinutes)})`;
  const copyTotal = async () => {
    try {
      await navigator.clipboard.writeText(totalText);
      setStatus(`Copied: ${totalText}`);
    } catch {
      setStatus(`Total: ${totalText}`);
    }
  };

  // Enter moves down a column, the way a spreadsheet does.
  const cellKeyDown = (event: KeyboardEvent, row: number, col: number) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const table = (event.currentTarget as HTMLElement).closest('table');
    table?.querySelector<HTMLInputElement>(`input[data-cell="${row + 1}-${col}"]`)?.focus();
  };

  const saveCard = () => {
    const name = form.name.trim();
    if (!name) {
      setStatus('Give the card a name to save it.');
      return;
    }
    const next = [...saved.filter((c) => c.name !== name), { ...card, name }];
    setSaved(next);
    writeStorage(SAVED_KEY, next);
    setStatus(`Saved "${name}" in this browser.`);
  };

  const deleteSaved = (name: string) => {
    if (!confirm(`Delete the saved card "${name}"?`)) return;
    const next = saved.filter((c) => c.name !== name);
    setSaved(next);
    writeStorage(SAVED_KEY, next);
  };

  const clearCard = () => {
    if (!confirm('Clear every time on this card?')) return;
    update({ name: '', texts: form.texts.map(emptyRow) });
  };

  const makeCopy = () => {
    history.replaceState(null, '', location.pathname);
    setShared(false);
    setStatus('This is now your own copy. Changes save in this browser.');
  };


  const shown = blank ? form.texts.map(emptyRow) : form.texts;
  const hasHours = result.totalMinutes > 0;
  const premiumMinutes = result.totals.overtime + result.totals.doubleTime;
  const weeks = (biweekly ? [0, 7] : [0]).map((start) => {
    const tiers = result.days.slice(start, start + 7);
    const regular = tiers.reduce((sum, tier) => sum + tier.regular, 0);
    const premium = tiers.reduce((sum, tier) => sum + tier.overtime + tier.doubleTime, 0);
    return { start, regular, premium, max: Math.max(60 * 60, Math.ceil((regular + premium) / 600) * 600) };
  });
  const settingsSummary = `${card.rateCents > 0 ? `Paid ${formatMoney(card.rateCents)} an hour` : 'No pay rate'}, ${rules.name} overtime rules, ${
    ROUNDING_PHRASES[form.rounding]
  }${biweekly ? ', two weeks' : ''}.`;

  const dayRow = (row: number) => {
    const timeline = blank ? null : timelines[row];
    const tiers = result.days[row];
    return (
      <Fragment key={row}>
        <tr>
          <th scope="row">
            <span class="day-full">{dayLabels[row]}</span>
            <span class="day-abbr" aria-hidden="true">{dayLabels[row].slice(0, 3)}</span>
          </th>
          {PUNCH_LABELS.map((label, col) => (
            <td key={col} class="punch">
              <input
                type="text"
                aria-label={`${dayLabels[row]} ${label.toLowerCase()}`}
                placeholder={label}
                autocomplete="off"
                data-cell={`${row}-${col}`}
                value={shown[row][col]}
                readOnly={shared}
                aria-invalid={!blank && invalid[row][col] ? 'true' : undefined}
                onInput={(e) => setCell(row, col, e.currentTarget.value)}
                onBlur={() => normalizeCell(row, col)}
                onKeyDown={(e) => cellKeyDown(e, row, col)}
              />
            </td>
          ))}
          <td class="track-cell no-print">
            <Bars window={scaleWindow} segments={timeline ? daySegments(timeline, tiers.overtime + tiers.doubleTime) : []} />
          </td>
          <td class="day-total">
            {!blank &&
              (result.dayMinutes[row] > 0 ? (
                <>
                  <strong>{formatDecimalHours(result.dayMinutes[row])}</strong> <span>{formatHM(result.dayMinutes[row])}</span>
                </>
              ) : (
                <span class="empty">{EMPTY_HOURS}</span>
              ))}
          </td>
        </tr>
        {!blank && mealFlags[row].length > 0 && (
          <tr class="flags no-print">
            <td colSpan={7}>
              <ul>
                {mealFlags[row].map((flag) => (
                  <li key={flag.code} class={flag.severity}>{flag.message}</li>
                ))}
              </ul>
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  return (
    <div class={`timecard${blank ? ' is-blank' : ''}${biweekly ? ' is-biweekly' : ''}`}>
      <h2 class="print-only print-title">Time Card</h2>
      {shared && (
        <p class="notice no-print">
          You are viewing a shared time card. <button type="button" onClick={makeCopy}>Make a copy</button> to edit it.
        </p>
      )}

      <div class="tc-layout">
        <div class="tc-main">
          <div class="tool">
            <button type="button" class="settings-summary no-print" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(!settingsOpen)}>
              <span>{settingsSummary}</span>
              <strong>{settingsOpen ? 'Done' : 'Edit'}</strong>
            </button>
            <fieldset class={`settings${settingsOpen ? '' : ' is-folded'}`} disabled={shared}>
              <legend class="visually-hidden">Card settings</legend>
              <label class="wide">
                Name
                <input type="text" placeholder="Maria, week of Sep 28" maxLength={200} value={blank ? '' : form.name} onInput={(e) => update({ name: e.currentTarget.value })} />
              </label>
              <label>
                Hourly rate ($)
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="18.50"
                  value={blank ? '' : form.rate}
                  aria-invalid={rateCents === null ? 'true' : undefined}
                  onInput={(e) => update({ rate: e.currentTarget.value })}
                />
              </label>
              <label class="no-print">
                Overtime rules
                <select value={form.ruleSet} onChange={(e) => update({ ruleSet: e.currentTarget.value as RuleSetId })}>
                  {Object.values(RULE_SETS).map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </label>
              <label class="no-print">
                Rounding
                <select value={form.rounding} onChange={(e) => update({ rounding: Number(e.currentTarget.value) as RoundingIncrement })}>
                  {ROUNDING_INCREMENTS.map((r) => (
                    <option key={r} value={r}>{ROUNDING_LABELS[r]}</option>
                  ))}
                </select>
              </label>
              <label class="no-print">
                Week starts on
                <select value={form.weekStart} onChange={(e) => update({ weekStart: Number(e.currentTarget.value) })}>
                  {DAY_NAMES.map((name, i) => (
                    <option key={i} value={i}>{name}</option>
                  ))}
                </select>
              </label>
              <label class="check no-print">
                <input type="checkbox" checked={biweekly} onChange={(e) => setBiweekly(e.currentTarget.checked)} />
                Two weeks (biweekly)
              </label>
            </fieldset>
            {'notes' in rules && <p class="rule-note no-print">{rules.name}: {rules.notes}</p>}

            <table class="punches">
              <thead>
                <tr>
                  <th scope="col" class="day">Day</th>
                  {PUNCH_LABELS.map((label) => (
                    <th scope="col" class="punch" key={label}>{label}</th>
                  ))}
                  <th class="track-cell no-print">
                    <Scale window={scaleWindow} />
                  </th>
                  <th scope="col" class="day-total">Hours</th>
                </tr>
              </thead>
              <tbody>
                {biweekly && (
                  <tr class="week-label"><th colSpan={7} scope="colgroup">Week 1</th></tr>
                )}
                {form.texts.slice(0, 7).map((_, row) => dayRow(row))}
                {biweekly && (
                  <tr class="week-label"><th colSpan={7} scope="colgroup">Week 2</th></tr>
                )}
                {biweekly && form.texts.slice(7).map((_, i) => dayRow(i + 7))}
              </tbody>
            </table>
            <p class="hint no-print">
              Type times any way you like: <kbd>9</kbd>, <kbd>830</kbd>, <kbd>8:30a</kbd>, <kbd>5p</kbd> or <kbd>17:30</kbd>. Leave lunch empty if there was none.
              Tab moves across and Enter moves down.
            </p>
          </div>

          <div class="tc-bar no-print">
            <p aria-hidden="true">
              <strong>{hasHours ? formatDecimalHours(result.totalMinutes) : EMPTY_HOURS}</strong> h
              {hasHours && (
                <span>
                  {premiumMinutes > 0 && `${formatDecimalHours(premiumMinutes)} overtime`}
                  {premiumMinutes > 0 && card.rateCents > 0 && ' · '}
                  {card.rateCents > 0 && formatMoney(result.pay.total)}
                </span>
              )}
            </p>
            <button type="button" onClick={copyTotal} disabled={!hasHours}>Copy</button>
          </div>
        </div>

        <aside class="readout" aria-label="Totals">
          <div class="readout-main no-print">
            <p class="cap">Total hours</p>
            <p class={`readout-total${hasHours ? '' : ' empty'}`}>{hasHours ? formatDecimalHours(result.totalMinutes) : EMPTY_HOURS}</p>
            <p class="readout-hm">
              {hasHours ? `${Math.floor(result.totalMinutes / 60)} h ${result.totalMinutes % 60} min` : 'Enter a time in and a time out.'}
            </p>
            {weeks.map((week) => (
              <Fragment key={week.start}>
                {biweekly && <p class="cap">Week {week.start / 7 + 1}</p>}
                <Gauge
                  max={week.max}
                  step={300}
                  value={week.regular}
                  premium={week.premium}
                  mark={rules.weeklyOvertimeAfter}
                  labels={[
                    { at: 0, text: '0' },
                    { at: rules.weeklyOvertimeAfter, text: `${rules.weeklyOvertimeAfter / 60} h overtime line` },
                    { at: week.max, text: String(week.max / 60) },
                  ]}
                />
              </Fragment>
            ))}
          </div>

          <dl class="totals" aria-live="polite">
            <div>
              <dt>Regular</dt>
              <dd>{blank ? '' : hours(result.totals.regular)}</dd>
              {card.rateCents > 0 && !blank && <dd class="pay">{formatMoney(result.pay.regular)}</dd>}
            </div>
            <div class={result.totals.overtime > 0 ? 'premium' : undefined}>
              <dt>Overtime (1.5×)</dt>
              <dd>{blank ? '' : hours(result.totals.overtime)}</dd>
              {card.rateCents > 0 && !blank && <dd class="pay">{formatMoney(result.pay.overtime)}</dd>}
            </div>
            {hasDoubleTime && (
              <div class={result.totals.doubleTime > 0 ? 'premium' : undefined}>
                <dt>Double time (2×)</dt>
                <dd>{blank ? '' : hours(result.totals.doubleTime)}</dd>
                {card.rateCents > 0 && !blank && <dd class="pay">{formatMoney(result.pay.doubleTime)}</dd>}
              </div>
            )}
            <div class="grand">
              <dt>Total hours</dt>
              <dd>{blank ? '' : hours(result.totalMinutes)}</dd>
            </div>
            {card.rateCents > 0 && !blank && (
              <div class="gross">
                <dt>Gross pay</dt>
                <dd>{formatMoney(result.pay.total)}</dd>
              </div>
            )}
          </dl>
          {!blank && hasMealFlags && (
            <p class="hint no-print">
              Meal-break notes follow {rules.name} law and are reminders, not a legal finding. If a required meal break was not provided, the employer owes one
              extra hour of pay at the regular rate for that workday (Labor Code § 226.7). The totals above do not include it.
            </p>
          )}

          {!blank && (
            <p class="print-only print-settings">
              Overtime rules: {rules.name}. Rounding: {ROUNDING_LABELS[form.rounding].toLowerCase()}. Workweek starts on {DAY_NAMES[form.weekStart]}.
            </p>
          )}
          <div class="print-only signatures">
            <p><span>Employee signature</span><span>Date</span></p>
            <p><span>Supervisor signature</span><span>Date</span></p>
          </div>

          <div class="actions no-print">
            <button type="button" onClick={copyTotal} disabled={!hasHours}>Copy total</button>
            <button type="button" class="secondary" onClick={() => window.print()}>Print or save as PDF</button>
            <button type="button" class="secondary" onClick={copyLink}>Copy share link</button>
            <button type="button" class="secondary" onClick={downloadCSV}>Download CSV</button>
            <button type="button" class="secondary" onClick={() => setBlank(true)}>Print blank time card</button>
            {!shared && <button type="button" class="secondary" onClick={saveCard}>Save card</button>}
            {!shared && <button type="button" class="secondary" onClick={clearCard}>Clear</button>}
          </div>
          <p class="status no-print" role="status">{status}</p>
          {shareUrl && <input class="no-print" type="text" readOnly value={shareUrl} aria-label="Share link" onFocus={(e) => e.currentTarget.select()} />}
        </aside>
      </div>

      {saved.length > 0 && (
        <section class="saved no-print">
          <h2>Saved cards</h2>
          <ul>
            {saved.map((c) => (
              <li key={c.name}>
                <span>{c.name}</span>
                <button type="button" class="secondary" onClick={() => { setShared(false); history.replaceState(null, '', location.pathname); update(formFromCard(c)); }}>Open</button>
                <button type="button" class="secondary" onClick={() => deleteSaved(c.name)}>Delete</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
