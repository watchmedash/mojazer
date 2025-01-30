const API_KEY = "4f599baa15d072c9de346b2816a131b8";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// API Endpoint for All Movies (Sorted by popularity)
const ALL_MOVIES_URL = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc`;

const videoPlayer = document.getElementById("videoPlayer");
const allMoviesList = document.getElementById("allMoviesList");
const searchInput = document.getElementById("searchInput");

let currentPage = 1; // Keep track of loaded pages
let loading = false; // Prevent duplicate requests

// Placeholder image for missing posters
const placeholderImage = "https://via.placeholder.com/200x300?text=No+Image";

// Native banner script
const banners = [
    {
        type: 'native-banner',
        html: `
        <script async="async" data-cfasync="false" src="//perilastronaut.com/d5a998a62e67ff5acb874aab36d07ef9/invoke.js"></script>
<div id="container-d5a998a62e67ff5acb874aab36d07ef9"></div>
        `
    }
];

// Function to Randomly Insert Banners into Movie List
function addRandomBanners(movies) {
    const updatedMovies = [...movies]; // Create a copy of the movie list
    const bannerCount = Math.floor(Math.random() * 3) + 1; // Random number of banners (1 to 3)

    for (let i = 0; i < bannerCount; i++) {
        const randomIndex = Math.floor(Math.random() * updatedMovies.length); // Random index for insertion
        const randomBanner = banners[Math.floor(Math.random() * banners.length)]; // Select random banner
        updatedMovies.splice(randomIndex, 0, randomBanner); // Insert native banner
    }

    return updatedMovies;
}

// Function to Fetch & Display Movies
function fetchMovies(url, listElement, page = 1) {
    fetch(`${url}&page=${page}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched Data:", data); // Log the entire data response

            // Check if movies are returned
            if (data.results && data.results.length > 0) {
                let movies = data.results.map(movie => {
                    const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : placeholderImage;
                    return {
                        title: movie.title,
                        id: movie.id,
                        poster: posterPath,
                        vote_average: movie.vote_average,
                        release_date: movie.release_date,
                        description: movie.overview // Get the description of the movie
                    };
                });

                // Add random banners to the movie list
                movies = addRandomBanners(movies);

                // Render movies and banners
                movies.forEach(item => {
                    let listItem = document.createElement("li");

                    if (item.type === 'native-banner') {
                        listItem.classList.add("banner");
                        listItem.innerHTML = item.html;
                    } else {
                        listItem.innerHTML = `
                            <img src="${item.poster}" alt="${item.title}">
                            <div class="movie-info">
                                <span class="movie-title">${item.title}</span>
                                <span class="movie-details">
                                    ⭐ ${item.vote_average.toFixed(1)} | 📅 ${item.release_date.split('-')[0]}
                                </span>
                                <p class="movie-description">${item.description}</p> <!-- Movie Description -->
                            </div>
                        `;

                        // Add click event to scroll to video player and load the correct video
                        listItem.addEventListener("click", () => {
                            videoPlayer.src = `https://vidsrc.me/embed/movie/${item.id}`;
                            videoPlayer.style.display = "block"; // Show the video player when movie is selected
                            window.scrollTo({
                                top: videoPlayer.offsetTop - 50, // Adjust scroll position
                                behavior: "smooth" // Smooth scroll
                            });
                        });
                    }

                    listElement.appendChild(listItem);
                });
            } else {
                console.log("No movies found in response.");
            }

            loading = false; // Allow more requests
        })
        .catch(error => {
            console.error("Error fetching movies:", error);
            loading = false; // Allow more requests even if an error occurs
        });
}

// Function to Search Movies by Title
function searchMovies(query) {
    // Clear the movie list before searching
    allMoviesList.innerHTML = '';

    const SEARCH_URL = `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${query}&page=1`;

    fetchMovies(SEARCH_URL, allMoviesList);
}

// Fetch First Page of All Movies
fetchMovies(ALL_MOVIES_URL, allMoviesList, currentPage);

// Infinite Scroll for "All Movies"
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !loading) {
        loading = true;
        currentPage++;
        fetchMovies(ALL_MOVIES_URL, allMoviesList, currentPage);
    }
});

// Search Input Event
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (query) {
        searchMovies(query); // Search movies by title
    } else {
        fetchMovies(ALL_MOVIES_URL, allMoviesList, currentPage); // Reset to all movies if search is empty
    }
});
