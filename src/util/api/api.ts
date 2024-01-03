import { currencyStore, dataLoading, entryStore, newsLoading, pageStore, sortByStore, sortDirStore } from "../../store/store";
import { API_KEY, CS_API_KEY, SORT_DIRECTION_ASCENDING /* LOCAL_HOST_IP */ } from "../constants";

let currency: string | undefined;
let order: string | undefined;
let sort: string | undefined;
let limit: number | undefined;
let currentPage: number | undefined;

currencyStore.subscribe((value) => {
  currency = value?.slice(0, value?.indexOf(" "));
});

sortDirStore.subscribe((value) => {
  order = value;
});

sortByStore.subscribe((value) => {
  sort = value;
});

entryStore.subscribe((value) => {
  limit = value;
});

pageStore.subscribe((value) => {
  currentPage = value;
});

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

export async function getData(customLimit?: number) {
  dataLoading.set({ isLoading: true });
  const apiEndpoint = "https://api.livecoinwatch.com/coins/list";
  const requestBody = {
    currency: currency || "USD",
    sort: sort || "rank",
    order: order || SORT_DIRECTION_ASCENDING,
    limit: customLimit ? customLimit : limit || 100,
    offset: currentPage && limit && currentPage * limit - limit,
    meta: true,
  };
  let data;
  try {
    data = await fetchData(apiEndpoint, requestBody);
    return data;
  } finally {
    dataLoading.set({ isLoading: false });
  }
}

export async function getHistoricalData(
  code: string | undefined | null,
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
  }
}

export async function getOverviewData() {
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

export async function getDataSingle(code: string | undefined) {
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
  }
}

export async function getMarketTickerData(
  coin: string | undefined,
  limit?: number | undefined | null,
  page?: number | undefined | null
) {
  const apiEndpoint = `https://openapiv1.coinstats.app/tickers/markets?fromCoin=${coin}&limit=${limit}&page=${page}&onlyVerified=true`;
  let data;
  try {
    data = await fetchDataCS(apiEndpoint);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
  }
}

export async function getFiatData() {
  const apiEndpoint = "https://openapiv1.coinstats.app/fiats";
  try {
    const data = await fetchDataCS(apiEndpoint);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
  }
}

export async function getExchangeTickerData() {
  const apiEndpoint = "https://openapiv1.coinstats.app/tickers/exchanges";
  try {
    const data = await fetchDataCS(apiEndpoint);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
  }
}

export async function getNewsData(query: string | undefined) {
  if (query === "BNB") {
    query = "Binance";
  }
  newsLoading.set(true);
  const apiEndpoint = `https://openapiv1.coinstats.app/news/search?limit=100&query=${query?.toLowerCase()}&orderBy=DATE`;
  try {
    const data = await fetchDataCS(apiEndpoint);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
    newsLoading.set(false);
  }
}

export async function getNewsDataById(id: string | undefined) {
  const apiEndpoint = `https://openapiv1.coinstats.app/news/${id}`;
  try {
    const data = await fetchDataCS(apiEndpoint);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
  }
}
