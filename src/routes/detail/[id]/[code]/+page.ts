export const prerender = "auto";

export function load({ params }) {
  return { data: [{ id: params.id, code: params.code }] };
}
