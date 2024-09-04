// Replace with your own TMDb API key
const apiKey = 'e63a16b6582df5d0a91d9853afc4589d';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

async function fetchRandomMovie() {
    try {
        const response = await fetch(`${apiBaseUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();
        const movie = data.results[Math.floor(Math.random() * data.results.length)];
        const imdbResponse = await fetch(`${apiBaseUrl}/movie/${movie.id}?api_key=${apiKey}&language=en-US&append_to_response=external_ids`);
        const imdbData = await imdbResponse.json();
        movie.imdb_id = imdbData.external_ids.imdb_id; // Assign IMDb ID
        return movie;
    } catch (error) {
        console.error("Error fetching movie:", error);
        return null;
    }
}

async function fetchRandomTVSeries() {
    try {
        const response = await fetch(`${apiBaseUrl}/tv/popular?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();
        const tvSeries = data.results[Math.floor(Math.random() * data.results.length)];
        const imdbResponse = await fetch(`${apiBaseUrl}/tv/${tvSeries.id}?api_key=${apiKey}&language=en-US&append_to_response=external_ids`);
        const imdbData = await imdbResponse.json();
        tvSeries.imdb_id = imdbData.external_ids.imdb_id; // Assign IMDb ID
        return tvSeries;
    } catch (error) {
        console.error("Error fetching TV series:", error);
        return null;
    }
}

async function fetchCredits(id, type) {
    try {
        const response = await fetch(`${apiBaseUrl}/${type}/${id}/credits?api_key=${apiKey}`);
        const data = await response.json();
        return data.cast.slice(0, 5).map(member => ({
            name: member.name,
            profile_path: member.profile_path
        }));
    } catch (error) {
        console.error("Error fetching credits:", error);
        return [];
    }
}

function createCastImages(castList) {
    return castList.map(cast => `
        <div class="cast-item">
            <img src="${cast.profile_path ? imageBaseUrl + cast.profile_path : 'https://via.placeholder.com/50'}" alt="${cast.name}">
            <span>${cast.name}</span>
        </div>
    `).join('');
}

async function suggest() {
    const movieDetailsElem = document.getElementById('movie-details');
    const tvDetailsElem = document.getElementById('tv-details');

    const movie = await fetchRandomMovie();
    const tvSeries = await fetchRandomTVSeries();

    if (movie) {
        const movieCast = await fetchCredits(movie.id, 'movie');
        movieDetailsElem.innerHTML = `
            <img src="${imageBaseUrl + movie.poster_path}" alt="${movie.title}" class="movie-poster">
            <strong>Title:</strong> <a href="https://www.imdb.com/title/${movie.imdb_id}" target="_blank">${movie.title}</a><br>
            <strong>Rating:</strong> ${movie.vote_average}/10<br>
            <strong>Overview:</strong> ${movie.overview}<br>
            <strong>Release Date:</strong> ${movie.release_date}<br>
            <strong>Cast:</strong>
            <div class="cast-images">
                ${createCastImages(movieCast)}
            </div>
        `;
    } else {
        movieDetailsElem.innerHTML = 'Could not fetch movie details.';
    }

    if (tvSeries) {
        const tvCast = await fetchCredits(tvSeries.id, 'tv');
        tvDetailsElem.innerHTML = `
            <img src="${imageBaseUrl + tvSeries.poster_path}" alt="${tvSeries.name}" class="tv-poster">
            <strong>Title:</strong> <a href="https://www.imdb.com/title/${tvSeries.imdb_id}" target="_blank">${tvSeries.name}</a><br>
            <strong>Rating:</strong> ${tvSeries.vote_average}/10<br>
            <strong>Overview:</strong> ${tvSeries.overview}<br>
            <strong>First Air Date:</strong> ${tvSeries.first_air_date}<br>
            <strong>Cast:</strong>
            <div class="cast-images">
                ${createCastImages(tvCast)}
            </div>
        `;
    } else {
        tvDetailsElem.innerHTML = 'Could not fetch TV series details.';
    }
}

document.getElementById('suggest-button').addEventListener('click', suggest);
