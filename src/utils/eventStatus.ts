import { EventTimeFilter, EventTimeStatus, FlatEvent } from '../types';

const MINUTE_MS = 60 * 1000;
const LIVE_WINDOW_MS = 3 * 60 * MINUTE_MS;

export const EVENT_TIME_FILTERS: EventTimeFilter[] = [
  'Tous',
  'En direct',
  'Bientot',
  'Fini',
];

export const getEventTimeStatus = (
  event: FlatEvent,
  currentTimeMs: number = Date.now(),
): EventTimeStatus => {
  const eventStartMs = event.unixTimestamp * 1000;

  if (eventStartMs > currentTimeMs) {
    return 'upcoming';
  }

  if (currentTimeMs <= eventStartMs + LIVE_WINDOW_MS) {
    return 'live';
  }

  return 'finished';
};

export const matchesEventTimeFilter = (
  event: FlatEvent,
  filter: EventTimeFilter,
  currentTimeMs: number = Date.now(),
): boolean => {
  if (filter === 'Tous') {
    return true;
  }

  const status = getEventTimeStatus(event, currentTimeMs);

  if (filter === 'En direct') {
    return status === 'live';
  }

  if (filter === 'Bientot') {
    return status === 'upcoming';
  }

  return status === 'finished';
};

export const getEventTimeStatusLabel = (
  event: FlatEvent,
  currentTimeMs: number = Date.now(),
): EventTimeFilter => {
  const status = getEventTimeStatus(event, currentTimeMs);

  if (status === 'live') {
    return 'En direct';
  }

  if (status === 'upcoming') {
    return 'Bientot';
  }

  return 'Fini';
};
