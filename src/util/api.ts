import { dataLoading } from "../store/store";
import { API_KEY, SORT_DIRECTION_ASCENDING } from "./constants";

export async function fetchData(apiEndpoint: string, requestBody: object) {
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function getData(
  currency?: string | undefined | null,
  sort?: string | undefined | null,
  order?: string | undefined | null,
  limit?: number | undefined | null
) {
  const apiEndpoint = "https://api.livecoinwatch.com/coins/list";
  const requestBody = {
    currency,
    sort: sort || "rank",
    order: order || SORT_DIRECTION_ASCENDING,
    limit: limit || 100,
    meta: true,
  };
  let data;
  try {
    data = await fetchData(apiEndpoint, requestBody);
    return data;
  } finally {
    dataLoading.set(false);
  }
}

export async function getHistoricalData(
  code: string | undefined | null,
  currency: string | undefined | null,
  start: number | undefined | null,
  end: number | undefined | null
) {
  const apiEndpoint = "https://api.livecoinwatch.com/coins/single/history";
  const requestBody = {
    currency,
    code,
    meta: true,
    start,
    end,
  };
  let data;
  try {
    data = await fetchData(apiEndpoint, requestBody);
    return data;
  } finally {
    // Perform actions here, regardless of success or failure
    // For example, dataLoading.set(false);
  }
}
