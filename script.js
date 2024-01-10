document.addEventListener('DOMContentLoaded', function () {
  const images = document.querySelectorAll('.image-container img');
  const container = document.querySelector('.image-container');
  let currentImageIndex = 0;

  function handleScroll() {
    const scrollPosition = window.scrollY;
    const newImageIndex = Math.floor(scrollPosition / window.innerHeight);

    const translateY = -newImageIndex * 100;
    container.style.transform = `translateY(${translateY}vh)`;
  }

  window.addEventListener('scroll', handleScroll);
});
