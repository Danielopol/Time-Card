export const SITE = {
  name: 'Hours Total',
  url: 'https://hourstotal.com',
  /** Shown on the About page as the person who runs the site. Leave empty to show no name. */
  owner: 'Daniel Marin',
  email: 'contact@hourstotal.com',
  /** Date the privacy policy last changed. */
  policyUpdated: 'October 3, 2026',
};

export interface Tool {
  href: string;
  label: string;
  /** Short name for the header. */
  short: string;
  blurb: string;
  /** A sample input and the answer it gives, shown in the tool list. */
  example: string;
  answer: string;
}

export const TOOLS: Tool[] = [
  {
    href: '/',
    label: 'Time Card Calculator',
    short: 'Time Card',
    blurb: 'Weekly hours with lunch breaks, overtime and gross pay.',
    example: 'Mon–Sun punches',
    answer: '47.50 h',
  },
  {
    href: '/hours-calculator/',
    label: 'Hours Calculator',
    short: 'Hours',
    blurb: 'Hours between a start time and an end time.',
    example: '8:00 AM – 4:30 PM',
    answer: '8 h 30 min',
  },
  {
    href: '/minutes-to-decimal/',
    label: 'Minutes to Decimal',
    short: 'Min → Dec',
    blurb: 'Convert hours and minutes to decimal hours, with a printable chart.',
    example: '8:40',
    answer: '8.67',
  },
  {
    href: '/decimal-to-minutes/',
    label: 'Decimal to Minutes',
    short: 'Dec → Min',
    blurb: 'Convert decimal hours back to hours and minutes.',
    example: '8.67',
    answer: '8:40',
  },
  {
    href: '/overtime-calculator/',
    label: 'Overtime Calculator',
    short: 'Overtime',
    blurb: 'Overtime and double-time pay from your rate and hours.',
    example: '47.5 h at $20.00',
    answer: '$1,025.00',
  },
  {
    href: '/military-time-converter/',
    label: 'Military Time Converter',
    short: '24-hour',
    blurb: 'Convert between 12-hour and 24-hour time.',
    example: '5:30 PM',
    answer: '1730',
  },
];
