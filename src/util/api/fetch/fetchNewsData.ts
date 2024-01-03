import type { NewsData } from "../../../types/Data";
import { getNewsData } from "@util/api/api";

export async function fetchNewsData(query: string | undefined) {
  try {
    const response = (await getNewsData(query)) as NewsData;

    if (response) {
      const newsItems = response.data;
      return newsItems.map((item: any) => ({
        id: item.id || "-",
        title: item.title || "-",
        description: item.description || "-",
        source: item.source || "-",
        link: item.link || "-",
        createdAt: item.createdAt || "-",
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
