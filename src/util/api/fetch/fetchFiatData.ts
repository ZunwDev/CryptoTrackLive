import type { FiatData } from "../../../types/Data";
import { getFiatData } from "@util/api/api";

export async function fetchFiatData() {
  try {
    const response = (await getFiatData()) as FiatData[];
    if (response) {
      return response.map((item: FiatData) => ({
        name: item.name,
        rate: item.rate,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
