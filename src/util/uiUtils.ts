import { goto } from "$app/navigation";
import { searchedTerm } from "@store/store";

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

export function handleDetailOpen(rank: number, code: string) {
  goto(`/detail/${rank}/${code}`);
  searchedTerm.set(code);
}

export function focusElement(element: HTMLElement) {
  setTimeout(() => {
    element.focus();
  }, 0);
}
