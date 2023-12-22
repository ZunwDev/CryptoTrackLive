import {
  dataLoading,
  detailLoading,
  exchangeLoading,
  fiatsLoading,
  marketLoading,
  secondaryDetailLoading,
} from "../store/store";
import { API_KEY, CS_API_KEY, SORT_DIRECTION_ASCENDING } from "./constants";

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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function fetchDataCS(apiEndpoint: string) {
  try {
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": CS_API_KEY, // Do the steps that are mentioned in README.md, don't insert your api key here publicly
      },
    });
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
  }
}

export async function getMarketTickerData(
  coin: string,
  limit?: number | undefined | null,
  page?: number | undefined | null
) {
  marketLoading.set(true);
  const apiEndpoint = `https://openapiv1.coinstats.app/tickers/markets?fromCoin=${coin}&limit=${limit}&page=${page}&onlyVerified=true`;
  let data;
  try {
    data = await fetchDataCS(apiEndpoint);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
    marketLoading.set(false);
  }
}

export async function getFiatData() {
  fiatsLoading.set(true);
  const apiEndpoint = "https://openapiv1.coinstats.app/fiats";
  try {
    const data = await fetchDataCS(apiEndpoint);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
    fiatsLoading.set(false);
  }
}

export async function getExchangeTickerData() {
  exchangeLoading.set(true);
  const apiEndpoint = "https://openapiv1.coinstats.app/tickers/exchanges";
  try {
    const data = await fetchDataCS(apiEndpoint);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
    exchangeLoading.set(false);
  }
}
