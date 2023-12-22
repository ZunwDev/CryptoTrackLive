import {
  globe,
  file,
  redditAlien,
  twitter,
  telegram,
  medium,
  instagram,
  youtubePlay,
  linkedin,
  spotify,
  soundcloud,
  twitch,
  wechat,
} from "svelte-awesome/icons";

export const API_KEY = import.meta.env.VITE_API_KEY;
export const SORT_DIRECTION_ASCENDING = "ascending";
export const SORT_DIRECTION_DESCENDING = "descending";
export const ENTRY_AMOUNT: number[] = [10, 25, 50, 100];
export const CURRENCIES: string[] = ["USD ($)", "EUR (€)", "GBP (£)", "AUD ($)", "CAD ($)", "BTC (₿)", "ETH (Ξ)"];
export const UPDATE_RATES: number[] = [5000, 10000, 15000, 20000, 25000, 30000];
export const OVERVIEW_NAMES: string[] = ["MARKET CAP", "VOLUME", "LIQUIDITY ±2%", "BTC DOM INDEX"];
export const MAIN_PAGE_URL: string = "https://cryptotrack-live.vercel.app";
export const LINK_ICONS: { [key: string]: any } = {
  website: globe,
  whitepaper: file,
  reddit: redditAlien,
  twitter: twitter,
  telegram: telegram,
  medium: medium,
  instagram: instagram,
  youtube: youtubePlay,
  linkedIn: linkedin,
  spotify: spotify,
  soundcloud: soundcloud,
  twitch: twitch,
  wechat: wechat,
};
