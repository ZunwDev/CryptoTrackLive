export function formatNumberToHTML(number: number) {
  const suffixes = ["", "K", "M", "B", "T"];
  const numAbs = Math.abs(number);
  const suffixNum = Math.min(Math.floor(Math.log10(numAbs) / 3), suffixes.length - 1);
  const shortValue = (numAbs / Math.pow(1000, suffixNum)).toFixed(2);
  const integerValue = shortValue.split(".")[0];
  const decimalValue = shortValue.split(".")[1];

  const decimalClass =
    decimalValue === "00" || decimalValue === "000"
      ? "text-text/30 dark:text-dark-text/30"
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
  window.scrollTo({
    top: document.documentElement.scrollHeight,
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
