import { TVChannel } from '../types';
import { isRecord, toErrorMessage } from '../utils/common';

const TV_SOURCE1_URL = 'https://api.cdn-live.tv/api/v1/channels/?user=cdnlivetv&plan=free';
const TV_SOURCE2_URL = 'https://myembed.xyz/247CHANNELS/canais247SOURCE2.php';
const TV_SOURCE2_PROXY_URLS = [
  `https://cors.eu.org/${TV_SOURCE2_URL}`,
  `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(TV_SOURCE2_URL)}`,
] as const;
const TV_REQUEST_HEADERS = {
  Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
};

type RawChannel = {
  code?: unknown;
  image?: unknown;
  name?: unknown;
  status?: unknown;
  url?: unknown;
};

type RawPayload = {
  channels?: unknown;
};

type ValidRawChannel = {
  code: string;
  image?: string;
  name: string;
  status?: string;
  url: string;
};

export const TV_FALLBACK_NOTICE =
  "Certaines chaines sont affichees depuis la liste locale de secours car la page officielle n'a pas pu etre chargee completement.";

export const fetchFrenchChannels = async (signal: AbortSignal): Promise<TVChannel[]> => {
  const [source1Result, source2Result] = await Promise.allSettled([
    fetchSource1(signal),
    fetchSource2(signal),
  ]);

  const source1Channels = source1Result.status === 'fulfilled' ? source1Result.value : [];
  const source2Channels = source2Result.status === 'fulfilled' ? source2Result.value : [];
  const mergedChannels = mergeChannels(source1Channels, source2Channels);

  if (mergedChannels.length > 0) {
    return mergedChannels;
  }

  const failures: string[] = [];

  if (source1Result.status === 'rejected') {
    failures.push(`Source 1: ${toErrorMessage(source1Result.reason)}`);
  }

  if (source2Result.status === 'rejected') {
    failures.push(`Source 2: ${toErrorMessage(source2Result.reason)}`);
  }

  throw new Error(failures.join(' | ') || 'Aucune chaine FR trouvee');
};

const fetchSource1 = async (signal: AbortSignal): Promise<TVChannel[]> => {
  const response = await fetch(TV_SOURCE1_URL, { signal });

  if (!response.ok) {
    throw new Error(`Source 1 indisponible (${response.status})`);
  }

  const payload = (await response.json()) as RawPayload;

  return extractRawChannels(payload)
    .filter((channel) => normalizeCountryCode(channel.code) === 'FR')
    .map((channel) => ({
      name: channel.name.trim(),
      image: normalizeImage(channel.image),
      country: 'FR',
      stream1: channel.url.trim(),
      stream2: '',
      status1: normalizeStatus(channel.status),
      status2: null,
    }));
};

const fetchSource2 = async (signal: AbortSignal): Promise<TVChannel[]> => {
  const failures: string[] = [];

  for (const proxyUrl of TV_SOURCE2_PROXY_URLS) {
    try {
      const response = await fetch(proxyUrl, {
        signal,
        headers: TV_REQUEST_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = parseJSONPayload(await response.text());

      return extractRawChannels(payload)
        .filter((channel) => normalizeCountryCode(channel.code) === 'FR')
        .map((channel) => ({
          name: formatSource2Name(channel.name),
          image: normalizeImage(channel.image),
          country: 'FR',
          stream1: '',
          stream2: channel.url.trim(),
          status1: null,
          status2: normalizeStatus(channel.status) ?? 'online',
        }));
    } catch (error) {
      failures.push(`${proxyUrl}: ${toErrorMessage(error)}`);
    }
  }

  throw new Error(failures.join(' | '));
};

const parseJSONPayload = (text: string): RawPayload => {
  const trimmedText = text.trim();
  const jsonStart = trimmedText.indexOf('{');

  if (jsonStart === -1) {
    throw new Error('JSON introuvable');
  }

  return JSON.parse(trimmedText.slice(jsonStart)) as RawPayload;
};

const extractRawChannels = (payload: RawPayload): ValidRawChannel[] => {
  if (!isRecord(payload) || !Array.isArray(payload.channels)) {
    throw new Error('Format de liste invalide');
  }

  return payload.channels.filter(isValidRawChannel);
};

const isValidRawChannel = (channel: unknown): channel is ValidRawChannel => {
  if (!isRecord(channel)) {
    return false;
  }

  return (
    typeof channel.name === 'string' &&
    typeof channel.code === 'string' &&
    typeof channel.url === 'string' &&
    (typeof channel.image === 'undefined' || typeof channel.image === 'string') &&
    (typeof channel.status === 'undefined' || typeof channel.status === 'string')
  );
};

const mergeChannels = (primary: TVChannel[], secondary: TVChannel[]): TVChannel[] => {
  const mergedChannels = new Map<string, TVChannel>();

  primary.forEach((channel) => {
    mergedChannels.set(normalizeChannelLookupName(channel.name), { ...channel });
  });

  secondary.forEach((channel) => {
    const key = normalizeChannelLookupName(channel.name);
    const existingChannel = mergedChannels.get(key);

    if (!existingChannel) {
      mergedChannels.set(key, { ...channel });
      return;
    }

    mergedChannels.set(key, {
      ...existingChannel,
      image: existingChannel.image || channel.image,
      stream2: channel.stream2 || existingChannel.stream2,
      status2: channel.status2 ?? existingChannel.status2 ?? null,
    });
  });

  return Array.from(mergedChannels.values()).sort((left, right) =>
    left.name.localeCompare(right.name, 'fr'),
  );
};

const normalizeCountryCode = (countryCode: string): string => {
  const normalizedCountryCode = countryCode.trim().toUpperCase();
  return normalizedCountryCode.length === 2
    ? normalizedCountryCode
    : normalizedCountryCode.slice(0, 2);
};

const normalizeChannelLookupName = (name: string): string =>
  name.replace(/\s+/g, '').toLowerCase();

const formatSource2Name = (name: string): string =>
  name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeImage = (image?: string): string => {
  if (!image || image === 'copy') {
    return '';
  }

  return image;
};

const normalizeStatus = (status?: string): string | null => {
  if (!status) {
    return null;
  }

  return status.toLowerCase();
};

