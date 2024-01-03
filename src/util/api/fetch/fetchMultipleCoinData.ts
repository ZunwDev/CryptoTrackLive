import type { CryptoData } from "../../../types/Data";
import { getChangeStatus } from "@util/dataUtils";
import { getData } from "@util/api/api";

export async function fetchMultipleCoinData(previousChanges: Record<string, number>) {
  try {
    const response = (await getData()) as CryptoData[];
    if (response) {
      //@ts-ignore
      return response.map((crypto) => ({
        rank: crypto.rank || 0,
        name: crypto.name || "-",
        code: crypto.code || "-",
        rate: crypto.rate || 0,
        change: crypto.change || 0,
        cap: crypto.cap || 0,
        volume: crypto.volume || 0,
        circulatingSupply: crypto.circulatingSupply || 0,
        totalSupply: crypto.totalSupply || 0,
        png64: crypto.png64 || "-",
        change1h: crypto.delta.hour || 0,
        change24h: crypto.delta.day || 0,
        changeStatus: getChangeStatus(crypto.code, crypto.delta.hour, previousChanges),
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
