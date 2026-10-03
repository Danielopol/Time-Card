export const SITE = {
  name: 'Hours Total',
  url: 'https://hourstotal.com',
};

export interface Tool {
  href: string;
  label: string;
  blurb: string;
}

export const TOOLS: Tool[] = [
  { href: '/', label: 'Time Card Calculator', blurb: 'Weekly hours with lunch breaks, overtime and gross pay.' },
  { href: '/hours-calculator/', label: 'Hours Calculator', blurb: 'Hours between a start time and an end time.' },
  { href: '/minutes-to-decimal/', label: 'Minutes to Decimal', blurb: 'Convert hours and minutes to decimal hours, with a printable chart.' },
  { href: '/decimal-to-minutes/', label: 'Decimal to Minutes', blurb: 'Convert decimal hours back to hours and minutes.' },
  { href: '/overtime-calculator/', label: 'Overtime Calculator', blurb: 'Overtime and double-time pay from your rate and hours.' },
  { href: '/military-time-converter/', label: 'Military Time Converter', blurb: 'Convert between 12-hour and 24-hour time.' },
];
