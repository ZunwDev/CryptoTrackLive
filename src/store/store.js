import { writable } from "svelte/store";

//Other
export const currencyStore = writable("USD ($)");
export const updateRate = writable(15000);

//Sorting
export const entryStore = writable(10);
export const sortDirStore = writable("ascending");
export const sortByStore = writable("rank");

//Pagination
export const pageStore = writable(1);
export const pageCountStore = writable(entryStore);

//Loading states
export const dataLoading = writable(true);
export const detailLoading = writable(true);
export const secondaryDetailLoading = writable(true);
