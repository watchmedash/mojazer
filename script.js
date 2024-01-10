document.addEventListener("DOMContentLoaded", function () {
  let currentPage = 0;
  const totalPages = document.querySelectorAll(".portfolio-page").length;

  function updateTransform() {
    const translateValue = `translateY(-${currentPage * 100}vh)`;
    document.getElementById("portfolio-container").style.transform = translateValue;
  }

  window.addEventListener("wheel", function (event) {
    if (event.deltaY > 0 && currentPage < totalPages - 1) {
      currentPage++;
    } else if (event.deltaY < 0 && currentPage > 0) {
      currentPage--;
    }

    updateTransform();
  });
});
