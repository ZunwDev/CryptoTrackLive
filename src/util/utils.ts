import { goto } from "$app/navigation";
import Chart from "chart.js/auto";

export function formatNumberToHTML(number: number) {
  const suffixes = ["", "K", "M", "B", "T", "QD", "QN", "SX"];
  const numAbs = Math.abs(number);
  const suffixNum = Math.min(Math.floor(Math.log10(numAbs) / 3), suffixes.length - 1);
  const shortValue = (numAbs / Math.pow(1000, suffixNum)).toFixed(2);
  const integerValue = shortValue.split(".")[0];
  const decimalValue = shortValue.split(".")[1];

  const decimalClass =
    decimalValue === "00" || decimalValue === "000"
      ? "text-text/50 dark:text-dark-text/50"
      : "text-text dark:text-dark-text";

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
  daysAgo.setUTCHours(0, 0, 0, 0);
  return daysAgo.getTime();
}

export function getCurrentUnixTime(startOfDay?: boolean) {
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  let firstNumber = currentHour >= 10 ? parseInt(currentHour.toString().slice(0, 1)) : currentHour;
  let secondNumber = currentHour >= 10 ? parseInt(currentHour.toString().slice(1, 2)) : null;

  if (startOfDay) {
    firstNumber = 0;
    secondNumber = 0;
  }

  if (secondNumber !== null) {
    currentDate.setUTCHours(firstNumber, secondNumber, 0, 0);
  } else {
    currentDate.setUTCHours(firstNumber, 0, 0, 0);
  }

  return currentDate.getTime();
}

export function handleDetailOpen(rank: number, code: string) {
  goto(`/detail/${rank}/${code}`);
}

export function convertDaysToDate(days: number) {
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const currentDate = new Date();
  const releaseTimestamp = currentDate.getTime() - days * millisecondsInADay;
  const releaseDate = new Date(releaseTimestamp);
  const formattedDate = `${releaseDate.getDate()}/${releaseDate.getMonth() + 1}/${releaseDate.getFullYear()}`;

  return formattedDate;
}

export function destroyChart(canvas: HTMLCanvasElement | null) {
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

function chartOptions(isDetail: boolean = false, currency?: string) {
  return {
    responsive: true,
    plugins: {
      legend: { display: isDetail },
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
      },
      y: {
        display: isDetail,
        title: { display: isDetail, text: "Price" },
      },
    },
  };
}

export function createLineChart(
  canvas: HTMLCanvasElement | null,
  prices: any[],
  isDetail?: boolean,
  currency?: string
) {
  const ctx = canvas?.getContext("2d");
  if (ctx) {
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: prices.length }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: "",
            fill: true,
            data: prices,
            borderColor: document.body.classList.contains("dark") ? "pink" : "rgba(143, 77, 151, 0.9)",
            backgroundColor: document.body.classList.contains("dark")
              ? "rgba(143, 77, 151, 0.7)"
              : "rgba(143, 77, 151, 0.4)",
            borderWidth: 1,
            pointRadius: isDetail && isDetail ? 3 : 0, // Hide points
          },
        ],
      },
      //@ts-ignore
      options: chartOptions(isDetail, currency),
    });
    chart.resize();
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
