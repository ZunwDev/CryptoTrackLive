export function formatNumberToHTML(number: number) {
  const suffixes = ["", "K", "M", "B", "T"];
  const numAbs = Math.abs(number);
  const suffixNum = Math.min(Math.floor(Math.log10(numAbs) / 3), suffixes.length - 1);
  const shortValue = (numAbs / Math.pow(1000, suffixNum)).toFixed(2);
  const integerValue = shortValue.split(".")[0];
  const decimalValue = shortValue.split(".")[1];

  const decimalClass = decimalValue === "00" ? "text-text/30 dark:text-dark-text/30" : "text-text dark:text-dark-text";

  if (Math.abs(number) < 100000) {
    const decimalValue = (Math.abs(number) % 1).toFixed(2).substring(2);
    const integerValue = Math.floor(Math.abs(number)).toLocaleString("en-US", { style: "decimal" });

    const spanElement = document.createElement("span");
    spanElement.innerHTML = `<span class="text-text dark:text-dark-text">${integerValue}</span><span class="${decimalClass}">.${decimalValue}</span>`;
    return spanElement;
  }

  const spanElement = document.createElement("span");
  spanElement.innerHTML = `<span class="text-text dark:text-dark-text">${integerValue}</span><span class="${decimalClass}">.${decimalValue}</span><span class="text-sm text-text dark:text-dark-text">${suffixes[suffixNum]}</span>`;
  return spanElement;
}
