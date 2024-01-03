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

export function convertCurrency(usdPrice: number, rate: number) {
  return usdPrice && rate ? usdPrice * rate : "Not supported";
}
