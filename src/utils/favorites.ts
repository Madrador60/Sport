import { FlatEvent, TVChannel } from '../types';

export const getEventFavoriteKey = (event: FlatEvent): string =>
  `${event.unixTimestamp}-${event.match}`;

export const getChannelFavoriteKey = (channel: TVChannel): string => channel.name;
