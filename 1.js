const express = require('express')
const fs = require('fs');
const app = express()
const port = 3000

app.set('view engine', 'ejs'); // Set EJS as view engine
app.use(express.static('public'));

app.use((req, res, next) => {
    req.movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf8'));
    req.userReviews = JSON.parse(fs.readFileSync('./data/userReviews.json', 'utf8'));
    req.criticReviews = JSON.parse(fs.readFileSync('./data/criticReviews.json', 'utf8'));
    next();
});

app.get('/', (req, res) => {


    res.render('index', { movies: req.movies, userReviews: req.userReviews, criticReviews: req.criticReviews, pagenumber: 1 }); // Render index.ejs file
});
app.get('/login', (req, res) => {
    res.render('login') // Render login.ejs file
})
app.get('/signup', (req, res) => {
    res.render('signup') // Render register.ejs file
})

app.get('/:slug([0-9]+)', (req, res) => {
    var pagenumber = parseInt(req.params.slug, 10);
    res.render('index', { movies: req.movies, userReviews: req.userReviews, criticReviews: req.criticReviews, pagenumber: pagenumber }) // Render 1.ejs file
})

app.get('/movie/:id', function(req, res) {
    let movies = req.movies;
    let userReviews = req.userReviews;
    let criticReviews = req.criticReviews;
    let movieIndex = req.query.movieIndex;
    
    let movie = movies.find(movie => movie.imdbID === req.params.id);
    let positiveReviews = userReviews[movieIndex][movie.Title].positive;
    let negativeReviews = userReviews[movieIndex][movie.Title].negative;
    let criticReviewItems = criticReviews[movieIndex][movie.Title].items;

    res.render('movieDetails', {
         movie: movie, 
         positiveReviews: positiveReviews, 
         negativeReviews: negativeReviews, 
         criticReviewItems: criticReviewItems 
        });
});

app.get('/search', (req, res) => {
    const query = req.query.q;
    const results = searchYourData(query);
    res.json(results);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})