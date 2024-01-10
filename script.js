document.addEventListener("DOMContentLoaded", function () {
  let currentPage = 1;
  const totalPages = document.querySelectorAll(".portfolio-page").length;

  window.addEventListener("wheel", function (event) {
    if (event.deltaY > 0 && currentPage < totalPages) {
      currentPage++;
    } else if (event.deltaY < 0 && currentPage > 1) {
      currentPage--;
    }

    const translateYValue = `translateY(-${(currentPage - 1) * 100}vh)`;
    document.getElementById("portfolio-container").style.transform = translateYValue;
  });
});
