import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { currencyStore, searchedTerm } from "@store/store";
import Chart from "chart.js/auto";

let currency: string | undefined;

currencyStore.subscribe((value) => {
  currency = value?.slice(0, value?.indexOf(" "));
});

export function formatNumberToHTML(number: number) {
  const suffixes = ["", "K", "M", "B", "T", "QD", "QN", "SX"];
  const numAbs = Math.abs(number);
  const suffixNum = Math.min(Math.floor(Math.log10(numAbs) / 3), suffixes.length - 1);
  const shortValue = (numAbs / Math.pow(1000, suffixNum)).toFixed(2);
  const integerValue = shortValue.split(".")[0];
  const decimalValue = shortValue.split(".")[1];

  const decimalClass =
    decimalValue === "00" || decimalValue === "000" ? "text-text/50 dark:text-dark-text/50" : "text-text dark:text-dark-text";

  const spanElement = document.createElement("span");

  if (Math.abs(number) < 100000) {
    const digits = Math.abs(number) > 1 ? 2 : 3;
    const integerValue = Math.abs(number).toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

    spanElement.innerHTML = `<span class="text-text dark:text-dark-text">${integerValue}</span>`;
    return spanElement;
  }

  spanElement.innerHTML = `<span class="text-text dark:text-dark-text">${integerValue}</span><span class="${decimalClass}">.${decimalValue}</span><span class="text-sm text-text dark:text-dark-text">${suffixes[suffixNum]}</span>`;
  return spanElement;
}

export function scrollToBottom() {
  const footerHeight = 127;
  const scrollPosition = document.documentElement.scrollHeight - window.innerHeight - footerHeight - 50;

  window.scrollTo({
    top: scrollPosition,
    behavior: "smooth",
  });
}

export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

export function toggleMenu(menu: HTMLElement | null, button: HTMLElement | null, otherMenu: HTMLElement | null) {
  if (menu && button) {
    const isMenuHidden = menu.classList.contains("hidden");
    const isOtherMenuHidden = otherMenu ? otherMenu.classList.contains("hidden") : true;

    if (isMenuHidden && !isOtherMenuHidden) {
      otherMenu?.setAttribute("aria-hidden", "true");
      otherMenu?.classList.add("hidden");
    }

    menu.setAttribute("aria-hidden", isMenuHidden ? "false" : "true");
    button.setAttribute("aria-expanded", isMenuHidden ? "true" : "false");
    menu.classList.toggle("hidden");
  }
}

export function handleClickOutside(event: MouseEvent, menu: HTMLElement | null, button: HTMLElement | null) {
  const target = event.target as HTMLElement;
  if (menu && button && !menu.contains(target) && target !== button && !target.classList.contains("Icon")) {
    menu.setAttribute("aria-hidden", "true");
    button.setAttribute("aria-expanded", "false");
    menu.classList.add("hidden");
  }
}

export function getUnixTimeXDaysAgo(days: number) {
  const today = new Date();
  const daysAgo = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  return daysAgo.getTime();
}

export function getCurrentUnixTime() {
  const currentDate = new Date();
  return currentDate.getTime();
}

export function getCurrentYear() {
  const currentDate = new Date();
  return currentDate.getFullYear();
}

export function handleDetailOpen(rank: number, code: string) {
  goto(`/detail/${rank}/${code}`);
  searchedTerm.set(code);
}

export function convertDaysToDate(days: number) {
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const currentDate = new Date();
  const releaseTimestamp = currentDate.getTime() - days * millisecondsInADay;
  const releaseDate = new Date(releaseTimestamp);
  const formattedDate = `${releaseDate.getDate()}/${releaseDate.getMonth() + 1}/${releaseDate.getFullYear()}`;

  return formattedDate;
}

export function destroyChartById(canvas: HTMLCanvasElement | null) {
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const chartInstance = Chart.getChart(ctx);
      if (chartInstance) {
        chartInstance.destroy();
      }
    }
  }
}

export function destroyChart() {
  if (chartInstance) {
    chartInstance = null;
  }
}

const handleResize = (chart: Chart) => {
  chart.resize();
};

function chartOptions(isDetail: boolean = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    onResize: handleResize,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: isDetail,
        callbacks: {
          title: function (tooltipItems: any) {
            return tooltipItems && tooltipItems.length > 0 ? "" : ``;
          },
          label: function (tooltipItem: any) {
            return `${currency}: ${tooltipItem.formattedValue}`;
          },
        },
      },
      title: { display: isDetail, text: `Price Chart (${currency})` },
    },
    scales: {
      x: {
        display: false,
        title: { display: false, text: "Days" },
        grid: { display: false },
      },
      y: {
        display: isDetail,
        title: { display: isDetail, text: "Price" },
        grid: { display: false },
      },
    },
  };
}

export function createLineChartMultiple(canvas: HTMLCanvasElement | null, prices: any[]) {
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      new Chart(ctx, {
        type: "line",
        data: {
          labels: Array.from({ length: prices.length }, (_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: "",
              fill: false,
              data: prices,
              borderColor: document.body.classList.contains("dark") ? "pink" : "rgba(143, 77, 151, 0.9)",
              backgroundColor: document.body.classList.contains("dark") ? "rgba(143, 77, 151, 0.7)" : "rgba(143, 77, 151, 0.4)",
              borderWidth: 2.5,
              pointRadius: 0,
            },
          ],
        },
        options: chartOptions(),
      });
    }
  }
}

let chartInstance: Chart | null = null;

export function createDetailLineChart(canvas: HTMLCanvasElement | null, prices: any[]) {
  try {
    if (canvas) {
      if (chartInstance) {
        chartInstance.data.datasets[0].data = prices;
        chartInstance.options = chartOptions(true);
        chartInstance.update();
        chartInstance.resize();
      } else {
        const ctx = canvas.getContext("2d");
        const gradient = ctx && ctx.createLinearGradient(0, 0, 0, 400);
        gradient &&
          gradient.addColorStop(
            0,
            document.body.classList.contains("dark") ? "rgba(143, 77, 151, 0.4)" : "rgba(143, 77, 151, 0.8)"
          );
        gradient && gradient.addColorStop(1, document.body.classList.contains("dark") ? "black" : "rgba(143, 77, 151, 0.1)");
        if (ctx) {
          chartInstance = new Chart(ctx, {
            type: "line",
            data: {
              labels: Array.from({ length: prices.length }, (_, i) => `Day ${i + 1}`),
              datasets: [
                {
                  label: "",
                  fill: true,
                  data: prices,
                  borderColor: document.body.classList.contains("dark") ? "pink" : "rgba(143, 77, 151, 0.9)",
                  //@ts-ignore
                  backgroundColor: gradient,
                  borderWidth: 2,
                  pointRadius: 3,
                },
              ],
            },
            options: chartOptions(true),
          });
          chartInstance.resize();
        } else return;
      }
    }
  } catch (error) {
    return;
  }
}

export function convertCurrency(usdPrice: number, rate: number | undefined) {
  return usdPrice && rate && usdPrice * rate;
}

export function generatePaginationLinks(currentPage: number, pageCount: number) {
  const linksToShow = 5;
  let startPage;
  if (currentPage > linksToShow - 1) {
    startPage = currentPage - linksToShow + 1;
  } else {
    startPage = 1;
  }
  const endPage = Math.min(startPage + linksToShow - 1, pageCount);
  const links = [];
  for (let i = startPage; i <= endPage; i++) {
    links.push(i);
  }
  return links;
}

export function getChangeStatus(cryptoCode: string, newChange: number, previousChanges: Record<string, number>) {
  const previous = parseFloat(previousChanges[cryptoCode] as unknown as string);

  if (!isNaN(previous) && !isNaN(newChange)) {
    if (newChange > previous) {
      return "+";
    } else if (newChange < previous) {
      return "-";
    } else {
      return "/";
    }
  } else {
    return "?";
  }
}

export async function checkDataReadiness(dataArrays: any[], store: any): Promise<void> {
  return new Promise((resolve) => {
    const int = setInterval(() => {
      if (dataArrays.every((array) => Array.isArray(array) && array.length > 0)) {
        store.set({ isLoading: false });
        clearInterval(int);
        resolve();
      }
    }, 0);
  });
}

export function timeAgo(timestamp: string) {
  const now: any = new Date();
  const date: any = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
}
