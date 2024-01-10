document.addEventListener("DOMContentLoaded", function () {
  let currentPage = 1;
  const totalPages = document.querySelectorAll(".portfolio-page").length;

  function updateOpacity() {
    const pages = document.querySelectorAll(".portfolio-page");
    pages.forEach((page, index) => {
      page.style.opacity = index + 1 === currentPage ? "1" : "0";
    });
  }

  window.addEventListener("wheel", function (event) {
    if (event.deltaY > 0 && currentPage < totalPages) {
      currentPage++;
    } else if (event.deltaY < 0 && currentPage > 1) {
      currentPage--;
    }

    updateOpacity();
  });
});
