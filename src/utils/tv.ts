import { TVChannel } from '../types';

const TV_EMBED_PREFIX = 'https://myembed.xyz/247CHANNELS/247embed.php?token=';
const TV_PLAYER_PREFIX = 'https://myembed.xyz/247CHANNELS/adsbridge.php?stream=';

export const getDefaultTVStream = (
  channel: Pick<TVChannel, 'stream1' | 'stream2' | 'status1' | 'status2'>,
): string | null => {
  if (channel.stream1 && channel.status1 !== 'offline') {
    return channel.stream1;
  }

  if (channel.stream2 && channel.status2 !== 'offline') {
    return channel.stream2;
  }

  return channel.stream1 || channel.stream2 || null;
};

export const buildTvEmbedUrl = (stream: string): string => {
  if (stream.includes('/247CHANNELS/247embed.php?token=')) {
    return stream;
  }

  const token = btoa(stream);
  return `${TV_EMBED_PREFIX}${encodeURIComponent(token)}`;
};

export const buildTvPlayerUrl = (stream: string): string => {
  if (stream.includes('/247CHANNELS/')) {
    return stream;
  }

  return `${TV_PLAYER_PREFIX}${encodeURIComponent(stream)}`;
};

export const getChannelInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

