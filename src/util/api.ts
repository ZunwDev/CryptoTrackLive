import { dataLoading, detailLoading, secondaryDetailLoading } from "../store/store";
import { API_KEY, SORT_DIRECTION_ASCENDING } from "./constants";

async function fetchData(apiEndpoint: string, requestBody: object) {
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY, // Do the steps that are mentioned in README.md, don't insert your api key here publicly
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
  limit?: number | undefined | null,
  currentPage?: number | undefined | null,
  currentEntry?: number | undefined | null
) {
  dataLoading.set(true);
  const apiEndpoint = "https://api.livecoinwatch.com/coins/list";
  const requestBody = {
    currency,
    sort: sort || "rank",
    order: order || SORT_DIRECTION_ASCENDING,
    limit: limit || 100,
    offset: currentPage && currentEntry && currentPage * currentEntry - currentEntry,
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
  secondaryDetailLoading.set(true);
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
    secondaryDetailLoading.set(false);
    // Perform actions here, regardless of success or failure
    // For example, dataLoading.set(false);
  }
}

export async function getOverviewData(currency: string | undefined | null) {
  const apiEndpoint = "https://api.livecoinwatch.com/overview";
  const requestBody = {
    currency,
    meta: true,
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

export async function getDataSingle(currency: string | undefined | null, code: string | undefined) {
  detailLoading.set(true);
  const apiEndpoint = "https://api.livecoinwatch.com/coins/single";
  const requestBody = {
    currency,
    code,
    meta: true,
  };
  let data;
  try {
    data = await fetchData(apiEndpoint, requestBody);
    return data;
  } finally {
    detailLoading.set(false);
    // Perform actions here, regardless of success or failure
    // For example, dataLoading.set(false);
  }
}
