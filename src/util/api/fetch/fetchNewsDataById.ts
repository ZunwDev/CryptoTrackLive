import { getNewsDataById } from "@util/api/api";

export async function fetchNewsDataById(id: string | undefined) {
  try {
    const response = await getNewsDataById(id);
    if (response) {
      return {
        imgUrl: response.imgUrl || "-",
      };
    } else {
      return { imgUrl: "-" };
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return { imgUrl: "-" };
  }
}
