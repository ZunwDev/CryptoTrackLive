import type { ExchangeData } from "../../../types/Data";
import { getExchangeTickerData } from "@util/api/api";

export async function fetchExchangeData() {
  try {
    const response = (await getExchangeTickerData()) as ExchangeData[];
    if (response) {
      return response.map((item: ExchangeData) => ({
        name: item.name || "-",
        url: item.url || "-",
        icon: item.icon || "-",
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
