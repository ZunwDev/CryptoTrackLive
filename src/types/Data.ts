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
