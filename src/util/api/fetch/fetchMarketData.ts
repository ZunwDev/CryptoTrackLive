import type { MarketData } from "../../../types/Data";
import { getMarketTickerData } from "@util/api/api";

export async function fetchMarketData(
  coin: string | undefined,
  entryCount: number | undefined,
  currentPage: number | undefined
) {
  try {
    const response = (await getMarketTickerData(coin, entryCount, currentPage)) as MarketData[];
    if (response) {
      //@ts-ignore
      return response.result.map((item: MarketData) => ({
        exchange: item.exchange || "-",
        from: item.from || "-",
        pair: item.pair || "-",
        price: item.price || 0,
        volume: item.volume || 0,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
