import LZString from 'lz-string';
import { parseCard, type TimeCard } from './timecard';

// A card travels in the URL fragment (#c=…), which browsers never send to a server.
const PARAM = 'c';

export function encodeCard(card: TimeCard): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(card));
}

export function decodeCard(encoded: string): TimeCard | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    return json ? parseCard(JSON.parse(json)) : null;
  } catch {
    return null;
  }
}

export function cardToFragment(card: TimeCard): string {
  return `#${PARAM}=${encodeCard(card)}`;
}

export function cardFromFragment(fragment: string): TimeCard | null {
  const encoded = new URLSearchParams(fragment.replace(/^#/, '')).get(PARAM);
  return encoded ? decodeCard(encoded) : null;
}
