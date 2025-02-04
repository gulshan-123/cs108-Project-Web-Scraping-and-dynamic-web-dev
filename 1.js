const express = require('express')
const fs = require('fs');
const app = express()
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const port = 3000

app.set('view engine', 'ejs'); // Set EJS as view engine
app.use(express.static('public'));// Set public folder as static folder
app.use(express.urlencoded({ extended: true }));// To parse the form data
app.use(session({// To create a session object so that we can store the user object in it which is logged in
    store: new FileStore(),
    secret: 'nobody-can-guess-this-secret',
    resave: false,
    saveUninitialized: true
}));
app.use((req, res, next) => { // Middleware to pass the session object to all routes in form of res.locals
    res.locals.user = req.session.user;
    next();
});
app.use((req, res, next) => { // Middleware to read the JSON files and pass the data to all routes
    req.movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf8'));
    req.userReviews = JSON.parse(fs.readFileSync('./data/userReviews.json', 'utf8'));
    req.criticReviews = JSON.parse(fs.readFileSync('./data/criticReviews.json', 'utf8'));
    req.myratings = JSON.parse(fs.readFileSync('./data/myratings.json', 'utf8'));
    next();
});

app.get('/', (req, res) => { // Home route
    // go to /1
    res.redirect('/1');
});
app.get('/login', (req, res) => { // handle login button
    res.render('login') // Render login.ejs file
})
app.get('/signup', (req, res) => { // handle signup button
    res.render('signup') // Render register.ejs file
})
app.get('/:slug([0-9]+)', (req, res) => { // do this only if the slug is a number, :slug is a route parameter
    //handle index page and pagination
    var pagenumber = parseInt(req.params.slug, 10);
    res.render('index', { movies: req.movies, userReviews: req.userReviews, criticReviews: req.criticReviews, pagenumber: pagenumber, myratings: req.myratings }) // Render 1.ejs file
})

app.get('/movie/:id', function (req, res) { // :id is a route parameter
    // handle movie details page
    let movies = req.movies;
    let userReviews = req.userReviews;
    let criticReviews = req.criticReviews;
    let movieIndex = req.query.movieIndex;

    let movie = movies.find(movie => movie.imdbID === req.params.id);
    if (movieIndex === undefined) {
        movieIndex = movies.findIndex(m => m.imdbID === movie.imdbID);
    }

    let positiveReviews = userReviews[movieIndex][movie.Title].positive;
    let negativeReviews = userReviews[movieIndex][movie.Title].negative;
    let criticReviewItems = criticReviews[movieIndex][movie.Title].items;

    res.render('movieDetails', {
        movie: movie,
        positiveReviews: positiveReviews,
        negativeReviews: negativeReviews,
        criticReviewItems: criticReviewItems,
        movieIndex: movieIndex
    });
});

app.post('/rate', (req, res) => {// handle the rate button on movie details page
    let movies = req.movies;

    let rating = req.body.rating;
    let movieIndex = req.body.movieIndex;
    let movie = movies[movieIndex];

    // Read the ratings from the JSON file
    fs.readFile('./data/myratings.json', 'utf8', (err, data) => {
        if (err) throw err;

        // Parse the data into a JavaScript object
        let ratings = JSON.parse(data);

        // Check if the user already has ratings
        if (ratings[req.session.user.email]) {
            // If the user has ratings, check if a rating for the movie already exists
            let userRatings = ratings[req.session.user.email];
            let existingRatingIndex = userRatings.findIndex(r => r.movie.Title === movie.Title);

            if (existingRatingIndex !== -1) {
                // If a rating for the movie exists, update it
                userRatings[existingRatingIndex].myrating = rating;
            } else {
                // If a rating for the movie doesn't exist, push a new one
                userRatings.push({ movie: movie, myrating: rating });
            }
        } else {
            // If the user doesn't have any ratings, create a new entry
            ratings[req.session.user.email] = [{ movie: movie, myrating: rating }];
        }

        // Write the updated data back to the file
        fs.writeFile('./data/myratings.json', JSON.stringify(ratings), (err) => {
            if (err) console.log(err);
            res.json({ status: 'success' });
        });
    });
});

app.get('/search', (req, res) => { // handle search button
    let movies = req.movies;
    let searchQuery = req.query.q;
    res.render('search', { movies: movies, searchQuery: searchQuery, myratings: req.myratings });
});
app.get('/genre', (req, res) => { // handle genre dropdown
    let movies = req.movies;

    const genre = req.query.genre.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
    // console.log(genre);
    const filteredMovies = movies.filter(movie => movie.genre.includes(genre));
    // console.log(filteredMovies);
    // find the index of the movie in the movies array for all movies in the filteredMovies array
    let movieIndex = [];
    for (let i = 0; i < filteredMovies.length; i++) {
        movieIndex.push(movies.indexOf(filteredMovies[i]));
    }
    // console.log(movieIndex);
    res.render('genre', { movies: filteredMovies, movieIndex: movieIndex, genre: genre, myratings: req.myratings });
    // res.render('genre', { movies: filteredMovies });

});

app.post('/handleSignup', (req, res) => { // what to do when the user submits the signup form
    const { email, password } = req.body;

    fs.readFile('./data/users.json', (err, data) => {
        if (err) throw err;

        const users = JSON.parse(data);

        // Check if email already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.send(`
                <p>Email already exists. You will be redirected in 1 seconds...</p>
                <script>
                    setTimeout(function() {
                        window.location.href = '/signup';
                    }, 1000);
                </script>
            `);
        }

        users.push({ email, password });

        fs.writeFile('./data/users.json', JSON.stringify(users), (err) => {
            if (err) throw err;

            res.send(`
                <p>Signup successful. You will be redirected in 1 seconds...</p>
                <script>
                    setTimeout(function() {
                        window.location.href = '/';
                    }, 1000);
                </script>
            `);
        });
    });
});

app.post('/handleLogin', (req, res) => { // what to do when the user submits the login form
    if (req.session.user) {
        return res.send(`
            <p>You are already logged in. You will be redirected in 1 seconds...</p>
            <script>
                setTimeout(function() {
                    window.location.href = '/';
                }, 1000);
            </script>
        `);
    }
    const { email, password } = req.body;

    fs.readFile('./data/users.json', (err, data) => {
        if (err) throw err;

        const users = JSON.parse(data);
        const user = users.find(user => user.email === email);

        if (!user) {
            return res.send(`
            <p>No user found with this email. Sign Up first. You will be redirected in 1 seconds...</p>
            <script>
                setTimeout(function() {
                    window.location.href = '/signup';
                }, 1000);
            </script>
        `);
        }

        if (user.password !== password) {
            return res.send(`
            <p>Incorrect Password !!! You will be redirected in 1 seconds...</p>
            <script>
                setTimeout(function() {
                    window.location.href = '/login';
                }, 1000);
            </script>
        `);
        }
        req.session.user = user; // it will create a session object for the user and store the user object in it, so that we can access it in other routes

        res.send(`
        <p>Login Successful... You will be redirected in 1 seconds...</p>
        <script>
            setTimeout(function() {
                window.location.href = '/';
            }, 1000);
        </script>
    `);
    });
});

app.get('/recommend', (req, res) => { // handle the recommend button
    // pass the ./data/myratings.json file to the recommend.ejs file
    let myratings = JSON.parse(fs.readFileSync('./data/myratings.json', 'utf8'));
    res.render('recommend', { myratings: myratings, movies: req.movies, });
});

app.get('/userRated', (req, res) => { // handle what to do when clicked on Rate tab on navbar
    let myratings = JSON.parse(fs.readFileSync('./data/myratings.json', 'utf8'));
    // console.log(myratings[req.session.user.email][0].movie.Title);
    res.render('userRated', { myratings: myratings, movies: req.movies });
});

app.get('/logout', (req, res) => { // handle the logout button
    req.session.destroy(); // it will destroy the session object
    res.redirect('/');
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})