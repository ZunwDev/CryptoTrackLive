import { getUnixTimeXDaysAgo, getCurrentUnixTime } from "@util/dateUtils";
import type { HistoricalCryptoData } from "../../../types/Data";
import { getHistoricalData } from "@util/api/api";
import { chartDaysAgo } from "@store/store";

let chartZoom: number | string;

chartDaysAgo.subscribe((value) => {
  chartZoom = value;
});

export async function fetchHistoricalData(code: string | undefined | null) {
  // TS = timestamp
  let condition = chartZoom !== "ALL" ? getUnixTimeXDaysAgo(Number(chartZoom)) : 1451606400000;
  try {
    const response = await getHistoricalData(code, condition, getCurrentUnixTime());
    if (response) {
      return response.history.map((item: HistoricalCryptoData) => ({
        code: response.code || "-",
        history: item.rate || null,
        date: item.date || null,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
