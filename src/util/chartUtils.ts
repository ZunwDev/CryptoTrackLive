import { Chart } from "chart.js/auto";
import { chartDaysAgo, currencyStore } from "@store/store";
import { convertTimestampToDate, convertUnixToDate } from "./dateUtils";

let currency: string;
let chartZoom: number;
let chartInstance: Chart | null = null;

currencyStore.subscribe((value) => {
  currency = value?.slice(0, value?.indexOf(" "));
});

chartDaysAgo.subscribe((value) => {
  chartZoom = value;
});

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
          title: function (tooltipItem: any) {
            return tooltipItem[0].label;
          },
          label: function (tooltipItem: any) {
            return `${currency}: ${tooltipItem.formattedValue}`;
          },
        },
      },
      title: { display: false },
    },
    scales: {
      x: {
        display: isDetail,
        title: { display: false, text: "Days" },
        grid: { display: false },
      },
      y: {
        display: isDetail,
        title: { display: false, text: "Price", position: "top" },
        grid: { display: false },
      },
    },
  };
}

export function createLineChartMultiple(canvas: HTMLCanvasElement, prices: any[]) {
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

export function createDetailLineChart(canvas: HTMLCanvasElement | null, prices: any[], dates: any[]) {
  try {
    if (canvas) {
      if (chartInstance) {
        chartInstance.data.datasets[0].data = prices;
        chartInstance.data.labels = dates.map((date) => {
          if (chartZoom === 1) {
            return convertTimestampToDate(date);
          } else {
            return convertUnixToDate(date);
          }
        });
        chartInstance.options = chartOptions(true);
        chartInstance.config.data.labels = chartInstance.data.labels;
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
              labels: dates.map((date) => {
                if (chartZoom === 1) {
                  return convertTimestampToDate(date);
                } else {
                  return convertUnixToDate(date);
                }
              }),
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
        } else {
          return;
        }
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return;
  }
}
