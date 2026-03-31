const FRENCH_TIME_ZONE = 'Europe/Paris';
const CLOCK_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FRENCH_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});
const DATE_KEY_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: FRENCH_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const NEWS_DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FRENCH_TIME_ZONE,
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatFrenchClockTime = (timestampMs: number): string =>
  CLOCK_FORMATTER.format(new Date(timestampMs));

export const getFrenchDateKey = (timestampMs: number): string =>
  DATE_KEY_FORMATTER.format(new Date(timestampMs));

export const formatEventTime = (unixTimestamp: number): string =>
  formatFrenchClockTime(unixTimestamp * 1000);

export const formatEventDateLabel = (_date: string, unixTimestamp: number): string => {
  const dateLabel = new Intl.DateTimeFormat('fr-FR', {
    timeZone: FRENCH_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(unixTimestamp * 1000));

  return `${dateLabel} - ${formatEventTime(unixTimestamp)}`;
};

export const formatLastUpdatedLabel = (timestampMs: number | null): string =>
  timestampMs ? `Maj ${formatFrenchClockTime(timestampMs)}` : 'Maj en attente';

export const formatNewsDateLabel = (timestampMs: number): string =>
  NEWS_DATE_FORMATTER.format(new Date(timestampMs)).replace(',', ' -');

export const formatRelativeNewsLabel = (timestampMs: number, currentTimeMs: number): string => {
  const deltaMinutes = Math.round((currentTimeMs - timestampMs) / 60000);

  if (deltaMinutes <= 1) {
    return 'A l instant';
  }

  if (deltaMinutes < 60) {
    return `Il y a ${deltaMinutes} min`;
  }

  const hours = Math.floor(deltaMinutes / 60);
  const minutes = deltaMinutes % 60;

  if (hours < 24) {
    return minutes > 0 ? `Il y a ${hours} h ${minutes}` : `Il y a ${hours} h`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return 'Hier';
  }

  return `Il y a ${days} jours`;
};

export const formatRelativeKickoff = (
  unixTimestamp: number,
  currentTimeMs: number,
): string => {
  const deltaMinutes = Math.round((unixTimestamp * 1000 - currentTimeMs) / 60000);

  if (Math.abs(deltaMinutes) <= 5) {
    return 'Maintenant';
  }

  if (deltaMinutes > 0) {
    const hours = Math.floor(deltaMinutes / 60);
    const minutes = deltaMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `Dans ${hours} h ${minutes}`;
    }

    if (hours > 0) {
      return `Dans ${hours} h`;
    }

    return `Dans ${minutes} min`;
  }

  const elapsedMinutes = Math.abs(deltaMinutes);
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `Il y a ${hours} h ${minutes}`;
  }

  if (hours > 0) {
    return `Il y a ${hours} h`;
  }

  return `Il y a ${elapsedMinutes} min`;
};
