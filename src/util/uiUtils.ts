import { goto } from "$app/navigation";
import { searchedTerm } from "@store/store";

export function handleClickOutside(menus: HTMLElement[] | null, buttons: HTMLElement[] | null) {
  if (menus && buttons) {
    for (let i = 0; i < menus.length; i++) {
      const menu = menus[i];
      const button = buttons[i];
      menu.classList.add("hidden");
      menu.setAttribute("aria-hidden", "true");
      button.setAttribute("aria-expanded", "false");
    }
  }
}

export function handleDetailOpen(rank: number, code: string) {
  goto(`/detail/${rank}/${code}`);
  searchedTerm.set(code);
}

export function focusElement(element: HTMLElement) {
  setTimeout(() => {
    element.focus();
  }, 0);
}

export function isElementClicked(target: HTMLElement, element: HTMLElement): boolean {
  return element === target || (element && element.contains(target));
}
