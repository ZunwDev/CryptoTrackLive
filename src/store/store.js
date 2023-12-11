import { writable } from "svelte/store";
// @ts-ignore
export const currencyStore = writable("USD ($)");
export const updateRate = writable(15000);
export const entryStore = writable(10);
export const sortDirStore = writable("ascending");
export const sortByStore = writable("rank");
export const dataLoading = writable(true);
export const pageStore = writable(1);
export const pageCountStore = writable(entryStore);
