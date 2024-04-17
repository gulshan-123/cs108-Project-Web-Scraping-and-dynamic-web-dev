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

    let maxSimilarity = 0;
    let mostSimilarMovie = null;
    let mostSimilarMovieIndex = -1;

    for (let i = 0; i < movies.length; i++) {
        let bigramTitle = bigramize(movies[i].Title.toLowerCase());
        let similarity = jaccard_similarity(bigramSearchQuery, bigramTitle);

        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarMovie = movies[i];
            mostSimilarMovieIndex = i;
        }
    }

    let htmlMovie=`<div>You Mean <span style="color:green">${mostSimilarMovie.Title}</span></div>`
    htmlMovie += `<div class="movie-container">
        <div class="row mb-3 text-center">`;

    if (mostSimilarMovie !== null) {
        htmlMovie += ` 
        <div class="card border-secondary col-sm-6 col-md-4 col-lg-3 col-xl-2 mb-3">
            <img class="card-img-top mx-auto d-block m-2 rounded" src="${mostSimilarMovie.Image['280w']}" alt="${mostSimilarMovie.Title}">
            <div class="card-body">
                <h5 class="card-title">${mostSimilarMovie.Title}</h5>
                <div class="card-text" style="text-align: left;">
                    <h6>Duration:&nbsp;<small class="text-muted">${mostSimilarMovie.Metadata[1]}</small></h6>
                    <h6>Rating:&nbsp;<small class="text-muted">${mostSimilarMovie.Rating[0]}/10</small></h6>
                    <h6>Genre:&nbsp;<small class="text-muted">${mostSimilarMovie.genre.join(', ')}</small></h6>
                    <h6>Director:&nbsp;<small class="text-muted">${mostSimilarMovie.Director.join(', ')}</small></h6>
                    <h6>Stars:&nbsp;<small class="text-muted">${mostSimilarMovie.Cast.join(', ')}</small></h6>
                </div>
            </div>
            <div class="card-footer">
        <a href="/movie/${mostSimilarMovie.imdbID}?movieIndex=${mostSimilarMovieIndex}">
            <button type="button" class="btn btn-secondary btn-sm" id="MoreBtn${mostSimilarMovieIndex}">More</button>
        </a>
            </div>
        </div>
        `;
    }

    // Add the closing tags
    htmlMovie += `</div></div>`;
    document.querySelector('.pagination').innerHTML=''
    document.querySelector('.otherThanNav').innerHTML=htmlMovie
}

function handleSearch() {
    let searchQuery = document.getElementById('search').value;
    searchMovies(searchQuery); // Update the content with the search results
}

document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    handleSearch();
});