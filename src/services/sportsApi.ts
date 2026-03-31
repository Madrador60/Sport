import { FlatEvent, SportEvent } from '../types';
import { isRecord, toErrorMessage } from '../utils/common';

const SPORTS_API_URL = 'https://myembed.xyz/api.php?format=json';
const SPORTS_PROXY_URLS = [
  `https://cors.eu.org/${SPORTS_API_URL}`,
  `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(SPORTS_API_URL)}`,
] as const;
const SPORTS_REQUEST_HEADERS = {
  Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
};

type SportsApiDayEntry = {
  date?: unknown;
  events?: unknown;
};

export const SPORTS_FALLBACK_NOTICE =
  "Affichage des donnees de demonstration car l'API live est temporairement indisponible.";

export const fetchLiveSportsEvents = async (signal: AbortSignal): Promise<FlatEvent[]> => {
  const failures: string[] = [];

  for (const source of SPORTS_PROXY_URLS) {
    try {
      const response = await fetch(source, {
        signal,
        headers: SPORTS_REQUEST_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const flattenedEvents = parseSportsApiResponse(await response.text());

      if (flattenedEvents.length === 0) {
        throw new Error('Aucun evenement recu');
      }

      return flattenedEvents;
    } catch (error) {
      failures.push(`${source}: ${toErrorMessage(error)}`);
    }
  }

  throw new Error(failures.join(' | '));
};

const parseSportsApiResponse = (text: string): FlatEvent[] => {
  let payload: unknown;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error('JSON invalide');
  }

  return extractDayEntries(payload)
    .flatMap((day) => {
      const date = typeof day.date === 'string' ? day.date.trim() : '';
      const entries = Array.isArray(day.events) ? day.events : [];

      return entries
        .map((entry) => parseSportsApiEvent(entry, date))
        .filter((event): event is FlatEvent => event !== null);
    })
    .sort((left, right) => left.unixTimestamp - right.unixTimestamp);
};

const extractDayEntries = (payload: unknown): SportsApiDayEntry[] => {
  if (!isRecord(payload) || !Array.isArray(payload.events)) {
    return [];
  }

  return payload.events;
};

const parseSportsApiEvent = (entry: unknown, date: string): FlatEvent | null => {
  if (!isRecord(entry)) {
    return null;
  }

  const unixTimestamp = Number(entry.unixTimestamp);
  const match = typeof entry.match === 'string' ? entry.match.trim() : '';
  const sport = typeof entry.sport === 'string' ? entry.sport.trim() : undefined;
  const channels = Array.isArray(entry.channels)
    ? entry.channels
        .filter((channel): channel is string => typeof channel === 'string')
        .map((channel) => channel.trim())
        .filter(Boolean)
    : [];

  if (!Number.isFinite(unixTimestamp) || !match || !date) {
    return null;
  }

  const sportEvent: SportEvent = {
    unixTimestamp,
    sport,
    match,
    channels,
  };

  return {
    ...sportEvent,
    date,
    sportType: normalizeSport(sportEvent),
  };
};

const normalizeSport = (event: SportEvent): string => {
  const rawSport = event.sport?.trim();

  if (rawSport) {
    return rawSport.toLowerCase() === 'ice hockey' ? 'Hockey' : rawSport;
  }

  return categorizeSport(event.match);
};

const categorizeSport = (matchTitle: string): string => {
  const title = matchTitle.toLowerCase();

  if (title.includes('tennis') || title.includes('atp') || title.includes('wta')) {
    return 'Tennis';
  }

  if (
    title.includes('football') ||
    title.includes('soccer') ||
    title.includes('u19') ||
    title.includes('fc ')
  ) {
    return 'Football';
  }

  if (title.includes('nba') || title.includes('basketball') || title.includes('euroleague')) {
    return 'Basketball';
  }

  if (title.includes('nhl') || title.includes('hockey')) {
    return 'Hockey';
  }

  if (title.includes('mlb') || title.includes('baseball')) {
    return 'Baseball';
  }

  if (title.includes('volleyball')) {
    return 'Volleyball';
  }

  if (title.includes('snooker')) {
    return 'Snooker';
  }

  if (title.includes('cricket')) {
    return 'Cricket';
  }

  if (title.includes('darts')) {
    return 'Darts';
  }

  if (title.includes('handball')) {
    return 'Handball';
  }

  return 'Autre';
};

