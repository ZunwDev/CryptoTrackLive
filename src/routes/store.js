import { writable } from "svelte/store";
// @ts-ignore
export const currencyStore = writable("USD ($)");
export const updateRate = writable(15000);
