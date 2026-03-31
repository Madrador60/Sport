export const formatEventTime = (unixTimestamp: number): string =>
  new Date(unixTimestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatEventDateLabel = (date: string, unixTimestamp: number): string =>
  `${date} - ${formatEventTime(unixTimestamp)}`;

