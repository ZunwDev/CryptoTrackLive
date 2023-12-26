export interface CryptoData {
  delta: any;
  rank: number;
  name: string;
  code: string;
  rate: number;
  change: number;
  cap: number;
  volume: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number;
  png64: string;
  change1h: number;
  change24h: number;
  changeStatus: string;
  age: number;
  allTimeHighUSD: number;
  links: object;
}

export interface HistoricalCryptoData {
  code: string;
  history: any;
  rate: number;
}

export interface OverviewData {
  cap?: number;
  volume?: number;
  liquidity?: number;
  btcDominance?: number;
  [key: string]: number | undefined | "N/A";
}

export interface NoCoinsFound {
  name: string;
  code: string;
  png64: string;
  rank: number | null;
}

export interface MarketData {
  icon: string;
  url: string;
  result?: any;
  exchange: string;
  from: string;
  pair: string;
  price: number;
  volume: number;
}

export interface FiatData {
  name: string;
  rate: number;
}

export interface ExchangeData {
  name: string;
  url: string;
  icon: string;
}

export interface NewsData {
  data: any;
  title: string;
  description: string;
  source: string;
  link: string;
  createdAt: string;
  contentHighlights: [];
}
