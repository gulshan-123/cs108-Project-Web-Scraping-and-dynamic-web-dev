// JavaScript code
async function getMovies() {
    const response = await fetch('/movies');
    const movies = await response.json();
    return movies;
}


function bigramize(title) {
    let bigrams = [];
    for (let i = 0; i < title.length - 1; i++) {
        bigrams.push(title.substring(i, i + 2));
    }
    return bigrams;
}

function jaccard_similarity(bigrams1, bigrams2) {
    const set1 = new Set(bigrams1);
    const set2 = new Set(bigrams2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}

async function searchMovies(searchQuery) {
    let movies = await getMovies();
    let bigramSearchQuery = bigramize(searchQuery.toLowerCase());

    let similarMovies = [];
    let maxSimilarity = 0;
    let mostSimilarMovie = null;
    let mostSimilarMovieIndex = -1;

    for (let i = 0; i < movies.length; i++) {
        let cleanedTitle = movies[i].Title.toLowerCase().replace(/[^a-z0-9\s]/gi, '');
        let bigramTitle = bigramize(cleanedTitle);
        let similarity = jaccard_similarity(bigramSearchQuery, bigramTitle);

        // Check if the search query is a substring of the movie title
        if (cleanedTitle.includes(searchQuery.toLowerCase().replace(/[\s]/g, '')) || cleanedTitle.includes(searchQuery.toLowerCase()) ) {
            similarMovies.push({ movie: movies[i], index: i });
        } else if (similarity > 0.55) {
            similarMovies.push({ movie: movies[i], index: i });
        }

        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarMovie = movies[i];
            mostSimilarMovieIndex = i;
        }
    }

    let htmlMovie = '';
    if (similarMovies.length > 0) {
        htmlMovie += `<div class="alert alert-info text-center" role="alert">
        These movies might be what you're looking for:
    </div>`;
        htmlMovie += `
        <div class="movie-container">
        <div class="row justify-content-center">`
        similarMovies.forEach(({ movie, index }) => {
            htmlMovie += generateMovieCard(movie, index);
        });
    } else if (mostSimilarMovie !== null) {
        htmlMovie += `<div class="alert alert-success text-center" role="alert">
        You might mean <strong>${mostSimilarMovie.Title}</strong>
    </div>`;
        htmlMovie += `<div class="movie-container">`
        htmlMovie += `<div class="row justify-content-center">`
        htmlMovie += generateMovieCard(mostSimilarMovie, mostSimilarMovieIndex);
    }

    htmlMovie += `</div>
    </div>`
    if (document.querySelector('.pagination') !== null){
    document.querySelector('.pagination').innerHTML = '';
    }
    if (document.querySelector('.otherThanNav') !== null){
    document.querySelector('.otherThanNav').innerHTML = htmlMovie;}
}

function generateMovieCard(movie, index) {
    return `
            <div class="card border-secondary col-sm-6 col-md-4 col-lg-3 col-xl-2 mb-3">
                <img class="card-img-top mx-auto d-block m-2 rounded" src="${movie.Image['280w']}" alt="${movie.Title}">
                <div class="card-body">
                    <h5 class="card-title">${movie.Title}</h5>
                    <div class="card-text" style="text-align: left;">
                        <h6>Duration:&nbsp;<small class="text-muted">${movie.Metadata[1]}</small></h6>
                        <h6>Rating:&nbsp;<small class="text-muted">${movie.Rating[0]}/10</small></h6>
                        <h6>Genre:&nbsp;<small class="text-muted">${movie.genre.join(', ')}</small></h6>
                        <h6>Director:&nbsp;<small class="text-muted">${movie.Director.join(', ')}</small></h6>
                        <h6>Stars:&nbsp;<small class="text-muted">${movie.Cast.join(', ')}</small></h6>
                    </div>
                </div>
                <div class="card-footer">
                    <a href="/movie/${movie.imdbID}?movieIndex=${index}">
                        <button type="button" class="btn btn-secondary btn-sm" id="MoreBtn${index}">More</button>
                    </a>
                </div>
            </div>
    `;
}

function handleSearch() {
    let searchQuery = document.getElementById('search').value;
    searchMovies(searchQuery); // Update the content with the search results
}

document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    handleSearch();
});