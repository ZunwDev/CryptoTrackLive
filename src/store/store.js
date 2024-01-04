import { writable } from "svelte/store";

//Other
export const currencyStore = writable("USD ($)");
export const updateRate = writable(15000);
export const searchedTerm = writable("");
export const isSearchBarPhoneHidden = writable(true);

//Sorting
export const entryStore = writable(10);
export const sortDirStore = writable("ascending");
export const sortByStore = writable("rank");
export const sortNewsBy = writable("Twitter");

//Pagination
export const pageStore = writable(1);
export const pageCountStore = writable(entryStore);

//Loading states
export const dataLoading = writable({ isLoading: true });
export const detailLoadingState = writable({ isLoading: true });
export const exchangeLoadingState = writable({ isLoading: true });
export const newsLoading = writable(true);

//Charts
export const chartDaysAgo = writable(7);
