export function generatePaginationLinks(currentPage: number, pageCount: number) {
  const linksToShow = 5;
  let startPage;
  if (currentPage > linksToShow - 1) {
    startPage = currentPage - linksToShow + 1;
  } else {
    startPage = 1;
  }
  const endPage = Math.min(startPage + linksToShow - 1, pageCount);
  const links = [];
  for (let i = startPage; i <= endPage; i++) {
    links.push(i);
  }
  return links;
}
