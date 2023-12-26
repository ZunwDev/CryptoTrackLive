import type { CryptoData } from "../../../types/Data";
import { getDataSingle } from "../api";

export async function fetchCoinData(code: string) {
  try {
    const response = (await getDataSingle(code)) as CryptoData;
    if (response) {
      return [
        {
          rank: response.rank || 0,
          name: response.name || "-",
          rate: response.rate || 0,
          code: response.code || "",
          change: response.delta?.hour || 0,
          cap: response.cap || 0,
          volume: response.volume || 0,
          circulatingSupply: response.circulatingSupply || 0,
          totalSupply: response.totalSupply || 0,
          maxSupply: response.maxSupply || 0,
          png64: response.png64 || "-",
          change1h: response.delta?.hour || 0,
          change24h: response.delta?.day || 0,
          age: response.age || 0,
          allTimeHighUSD: response.allTimeHighUSD || 0,
          links: response.links,
        },
      ];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
