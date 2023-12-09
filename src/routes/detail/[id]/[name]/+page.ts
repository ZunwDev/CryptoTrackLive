export const prerender = true;

export function load({ params }) {
  if (params.id || params.name) {
    console.log(params.id, params.name);
  }
}
