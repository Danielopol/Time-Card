import type { RuleSetId } from './engine/rules/index';

export interface StateExample {
  title: string;
  intro: string;
  /** Hours worked Monday to Sunday. */
  hours: number[];
  rateCents: number;
}

export interface StatePage {
  slug: string;
  ruleSet: RuleSetId;
  name: string;
  /** Page title. Keep under about 60 characters. */
  title: string;
  description: string;
  lede: string;
  /** The rules in plain English, one paragraph each. */
  rules: string[];
  examples: StateExample[];
  extras: { heading: string; paragraphs: string[] }[];
  notCovered: string[];
  faq: { q: string; a: string }[];
  updated: string;
}

export const STATES: readonly StatePage[] = [
  {
    slug: 'california',
    ruleSet: 'california',
    name: 'California',
    title: 'California Overtime Rules: Daily, Weekly and Double Time',
    description:
      'California overtime rules explained: 1.5 times pay after 8 hours a day or 40 a week, double time after 12 hours, and the seventh-day rule, with worked examples.',
    lede: 'California counts overtime by the day as well as by the week, and it has a double-time tier. The same hours can pay more here than under federal rules.',
    rules: [
      'Hours over 8 in a workday and hours over 40 in a workweek are paid at 1.5 times the regular rate. The first 8 hours on the seventh day of work in a workweek are also paid at 1.5 times.',
      'Hours over 12 in a workday, and hours over 8 on the seventh day of work in a workweek, are paid at double the regular rate.',
      'An employer does not have to combine more than one overtime rate for the same hour, so an hour paid as daily overtime is not paid again as weekly overtime.',
      'This calculator applies the seventh-day rule when every day of the workweek has hours entered.',
    ],
    examples: [
      {
        title: 'Five 10-hour days',
        intro: 'Each day has 2 hours of daily overtime. The weekly rule adds nothing, because the regular hours come to exactly 40.',
        hours: [10, 10, 10, 10, 10, 0, 0],
        rateCents: 2000,
      },
      {
        title: 'One 13-hour day',
        intro: 'The day has three tiers: 8 regular hours, 4 hours at 1.5 times and 1 hour at double time.',
        hours: [13, 0, 0, 0, 0, 0, 0],
        rateCents: 2000,
      },
      {
        title: 'Working all seven days',
        intro:
          'The first five days fill the 40 regular hours. The sixth day is weekly overtime, and the seventh day is overtime for its first 8 hours.',
        hours: [8, 8, 8, 8, 8, 8, 8],
        rateCents: 2000,
      },
    ],
    extras: [
      {
        heading: 'Meal and rest breaks',
        paragraphs: [
          'California also has meal-break and rest-break rules, with extra pay owed when they are missed. With California selected, the time card calculator notes days where a meal break looks late, short or missing. The rules are explained in the guide to California meal and rest breaks.',
        ],
      },
    ],
    notCovered: [
      'Employees on an alternative workweek schedule, or covered by some union contracts, follow different overtime rules.',
      'Employees who are exempt from overtime.',
      'Pay with more than one rate, or with bonuses that change the overtime rate.',
      'The calculator treats each row of the card as one workday.',
    ],
    faq: [
      {
        q: 'Does California pay overtime after 8 hours a day?',
        a: 'Yes. Work over 8 hours in a workday is paid at 1.5 times the regular rate, even if the week stays under 40 hours. Work over 12 hours in a day is paid at double the regular rate.',
      },
      {
        q: 'Is overtime in California counted by the day or by the week?',
        a: 'Both. Daily overtime applies after 8 hours in a day, and weekly overtime applies after 40 hours in a workweek. An hour paid as daily overtime is not paid again as weekly overtime.',
      },
      {
        q: 'What is the seventh-day rule?',
        a: 'On the seventh day of work in a workweek, the first 8 hours are paid at 1.5 times the regular rate and any hours over 8 are paid at double the regular rate.',
      },
      {
        q: 'When does double time start in California?',
        a: 'After 12 hours in a workday. On a seventh day of work in a workweek, double time starts after 8 hours.',
      },
      {
        q: 'Does the calculator handle alternative workweek schedules?',
        a: 'No. Some employees work an alternative workweek schedule, such as four 10-hour days, adopted under special rules. They follow different overtime rules, so use your employer\'s payroll figures if that applies to you.',
      },
    ],
    updated: '2026-10-06',
  },
  {
    slug: 'alaska',
    ruleSet: 'alaska',
    name: 'Alaska',
    title: 'Alaska Overtime Rules: 8 Hours a Day and 40 a Week',
    description:
      'Alaska overtime rules explained: 1.5 times pay after 8 hours in a day or 40 in a week, how the two rules combine, who is exempt, with worked examples.',
    lede: 'Alaska pays overtime after 8 hours in a day as well as after 40 in a week. Hours already paid as daily overtime do not count again toward the weekly 40.',
    rules: [
      'Hours over 8 in a day and hours over 40 in a week are paid at 1.5 times the regular rate of pay.',
      'To decide whether someone has worked more than 40 hours in a week, hours that were worked over 8 in a day and paid as overtime are not counted. The same hour is never paid as overtime twice.',
      'Under a voluntary flexible work hour plan approved by the Alaska Department of Labor, a schedule of 10-hour days and a 40-hour week can be used, with overtime after 10 hours in a day.',
      'The rule does not apply to employees of an employer with fewer than four employees in the regular course of business, and the law lists other exempt jobs, such as some agricultural work.',
    ],
    examples: [
      {
        title: 'Five 9-hour days',
        intro: 'Each day has 1 hour of daily overtime. The weekly rule adds nothing, because the other hours total exactly 40.',
        hours: [9, 9, 9, 9, 9, 0, 0],
        rateCents: 2000,
      },
      {
        title: 'Six 8-hour days',
        intro: 'No day passes 8 hours, so there is no daily overtime. The week reaches 48 hours, and the hours over 40 are weekly overtime.',
        hours: [8, 8, 8, 8, 8, 8, 0],
        rateCents: 2000,
      },
      {
        title: 'Long days plus a short one',
        intro:
          'Four 10-hour days give 8 hours of daily overtime. Those hours are left out of the weekly count, so the remaining 40 hours do not trigger more overtime.',
        hours: [10, 10, 10, 10, 8, 0, 0],
        rateCents: 2000,
      },
    ],
    extras: [],
    notCovered: [
      'Employers with fewer than four employees, and the other exemptions listed in the law.',
      'Flexible work hour plans approved by the Alaska Department of Labor.',
      'Pay with more than one rate, or with bonuses that change the overtime rate.',
    ],
    faq: [
      {
        q: 'Does Alaska pay overtime after 8 hours a day?',
        a: 'Yes. Alaska requires overtime at 1.5 times the regular rate for hours over 8 in a day and for hours over 40 in a week.',
      },
      {
        q: 'Are daily overtime hours counted again toward the 40-hour week?',
        a: 'No. When working out whether someone has worked more than 40 hours in a week, hours that are paid as daily overtime are left out.',
      },
      {
        q: 'Does Alaska have double time?',
        a: 'No. The overtime section of the Alaska statute sets one rate, 1.5 times the regular rate of pay, and has no double-time tier.',
      },
      {
        q: 'Who is exempt from Alaska overtime?',
        a: 'Among others, employees of an employer with fewer than four employees in the regular course of business. The law lists further exempt jobs, so check with the Alaska Department of Labor if you are unsure.',
      },
    ],
    updated: '2026-10-06',
  },
  {
    slug: 'nevada',
    ruleSet: 'nevada',
    name: 'Nevada',
    title: 'Nevada Overtime Rules: Daily Overtime and the $18 Threshold',
    description:
      'Nevada overtime rules explained: 1.5 times pay after 40 hours a week, plus after 8 hours a day for employees earning under 1.5 times minimum wage, with examples.',
    lede: 'In Nevada, how much you earn decides whether you get daily overtime. Employees below a pay threshold are paid overtime after 8 hours in a day as well as after 40 in a week.',
    rules: [
      'Employees paid less than 1.5 times the state minimum wage are paid 1.5 times their regular rate for hours over 40 in a scheduled week, and for hours over 8 in a workday.',
      'Employees paid at least 1.5 times the state minimum wage get overtime only for hours over 40 in a scheduled week.',
      'With Nevada\'s minimum wage at $12.00 in July 2026, the dividing line is $18.00 an hour. The figure changes if the minimum wage changes.',
      'Daily overtime does not apply to an employee who, by mutual agreement with the employer, works a scheduled four days of 10 hours within a scheduled week.',
      'The law lists many exempt jobs and situations, including some salespeople, drivers and employees under certain union contracts.',
    ],
    examples: [
      {
        title: 'Four 10-hour days at $15 an hour',
        intro:
          'At $15 an hour the employee is below the threshold, so each day has 2 hours of daily overtime. Under an agreed four-day, 10-hour schedule there would be none.',
        hours: [10, 10, 10, 10, 0, 0, 0],
        rateCents: 1500,
      },
      {
        title: 'Five 9-hour days at $15 an hour',
        intro: 'Each day has 1 hour of daily overtime. The weekly rule adds nothing, because the other hours total exactly 40.',
        hours: [9, 9, 9, 9, 9, 0, 0],
        rateCents: 1500,
      },
    ],
    extras: [
      {
        heading: 'If you earn $18.00 an hour or more',
        paragraphs: [
          'Choose the Federal rules in the time card calculator. Above the threshold only the weekly rule applies, and that is the same as the federal rule.',
        ],
      },
    ],
    notCovered: [
      'The wage threshold. The calculator applies daily overtime to every employee when Nevada is selected, so choose Federal if you earn $18.00 an hour or more.',
      'Agreed schedules of four 10-hour days, which have no daily overtime.',
      'The exempt jobs listed in the law.',
      'The calculator treats each row of the card as one workday.',
    ],
    faq: [
      {
        q: 'Does Nevada pay overtime after 8 hours a day?',
        a: 'Only for employees paid less than 1.5 times the state minimum wage, which is less than $18.00 an hour when the minimum wage is $12.00. Higher-paid employees get overtime only after 40 hours in a week.',
      },
      {
        q: 'What is the Nevada overtime wage threshold?',
        a: '1.5 times the state minimum wage. With a $12.00 minimum wage in July 2026 that is $18.00 an hour. Check the Nevada Labor Commissioner\'s yearly bulletin for the current figure.',
      },
      {
        q: 'Do four 10-hour days get daily overtime in Nevada?',
        a: 'Not when the employee works a scheduled four days of 10 hours within a scheduled week by mutual agreement with the employer. Daily overtime is excluded for that schedule.',
      },
      {
        q: 'Which rules should I pick if I earn more than $18 an hour in Nevada?',
        a: 'Pick Federal. Above the threshold only weekly overtime applies, and that works the same way as the federal rule.',
      },
    ],
    updated: '2026-10-06',
  },
  {
    slug: 'colorado',
    ruleSet: 'colorado',
    name: 'Colorado',
    title: 'Colorado Overtime Rules: 12 Hours a Day and 40 a Week',
    description:
      'Colorado overtime rules (COMPS Order #40) explained: 1.5 times pay after 40 hours a week, 12 hours a day or 12 consecutive hours, with worked examples.',
    lede: 'Colorado pays overtime after 40 hours in a week, after 12 hours in a day, or after 12 consecutive hours, whichever pays the employee the most.',
    rules: [
      'Employees are paid 1.5 times the regular rate for work over 40 hours in a workweek, over 12 hours in a workday, or over 12 consecutive hours regardless of when the workday starts and ends.',
      'Whichever of the three calculations gives the greater pay applies. They are not added together.',
      'Hours worked in two or more workweeks are not averaged when working out overtime.',
      'In counting 12 consecutive hours, meal periods can be subtracted only if they meet the rule for meal periods.',
      'These rules come from the Colorado Overtime and Minimum Pay Standards Order (COMPS Order) #40, effective February 1, 2026.',
    ],
    examples: [
      {
        title: 'Five 10-hour days',
        intro: 'No day passes 12 hours, so the daily rule adds nothing. The week reaches 50 hours, and the hours over 40 are overtime.',
        hours: [10, 10, 10, 10, 10, 0, 0],
        rateCents: 2000,
      },
      {
        title: 'One 14-hour day',
        intro: 'The first 12 hours are regular and the last 2 are daily overtime. The week is far short of 40 hours.',
        hours: [14, 0, 0, 0, 0, 0, 0],
        rateCents: 2000,
      },
      {
        title: 'Four 13-hour days',
        intro:
          'The daily rule gives 4 hours of overtime. The weekly rule gives 12 hours of overtime, because the week reaches 52. The greater one applies.',
        hours: [13, 13, 13, 13, 0, 0, 0],
        rateCents: 2000,
      },
    ],
    extras: [
      {
        heading: 'Meal and rest periods',
        paragraphs: [
          'Colorado\'s order gives employees an uninterrupted, duty-free meal period of at least 30 minutes when a shift exceeds 5 consecutive hours, and a paid 10-minute rest period for each 4 hours of work or major fraction of that. The time card calculator does not check meal periods for Colorado.',
        ],
      },
    ],
    notCovered: [
      'The 12-consecutive-hours rule when a stretch of work crosses from one day to the next. The calculator counts each row of the card as one workday.',
      'Exemptions and variances listed in the order.',
      'Pay with more than one rate, or with bonuses that change the overtime rate.',
    ],
    faq: [
      {
        q: 'Does Colorado pay overtime after 8 hours a day?',
        a: 'No. Colorado\'s daily overtime starts after 12 hours in a day. Overtime also starts after 40 hours in a workweek, whichever pays more.',
      },
      {
        q: 'What are the 12 consecutive hours?',
        a: 'Overtime also applies to work over 12 consecutive hours, whatever time the workday starts and ends. It can matter when a long shift crosses midnight. This calculator does not track it across days.',
      },
      {
        q: 'Do the daily and weekly rules add together?',
        a: 'No. Whichever calculation gives the employee the greater pay is the one that applies.',
      },
      {
        q: 'Can overtime be averaged over two weeks in Colorado?',
        a: 'No. Hours worked in two or more workweeks are not averaged. Each workweek is counted on its own.',
      },
    ],
    updated: '2026-10-06',
  },
];

export function getState(slug: string): StatePage {
  const state = STATES.find((s) => s.slug === slug);
  if (!state) throw new Error(`Unknown state page: ${slug}`);
  return state;
}

export const statePath = (slug: string) => `/states/${slug}/`;
