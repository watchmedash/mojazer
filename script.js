document.addEventListener('DOMContentLoaded', function () {
  const images = document.querySelectorAll('.image-container img');
  let currentImageIndex = 0;

  function handleScroll() {
    const scrollPosition = window.scrollY;
    const newImageIndex = Math.floor(scrollPosition / window.innerHeight);

    if (newImageIndex !== currentImageIndex) {
      images[currentImageIndex].style.opacity = 0;
      images[newImageIndex].style.opacity = 1;
      currentImageIndex = newImageIndex;
    }
  }

  window.addEventListener('scroll', handleScroll);

  // Trigger initial check to set the correct image based on initial scroll position
  handleScroll();
});
