export function scrollToBottom() {
  const footerHeight = 127;
  const scrollPosition = document.documentElement.scrollHeight - window.innerHeight - footerHeight - 50;

  window.scrollTo({
    top: scrollPosition,
    behavior: "smooth",
  });
}

export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
