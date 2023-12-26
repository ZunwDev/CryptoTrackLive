import type { HistoricalCryptoData } from "../../../types/Data";
import { getHistoricalData } from "../api";

export async function fetchHistoricalData(
  code: string | undefined | null,
  startTS: number | undefined | null,
  endTS: number | undefined | null
) {
  // TS = timestamp
  try {
    const response = await getHistoricalData(code, startTS, endTS);
    if (response) {
      return response.history.map((item: HistoricalCryptoData) => ({
        code: response.code || "-",
        history: item.rate || null,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
