const express = require('express')
const fs = require('fs');
const app = express()
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const port = 3000

app.set('view engine', 'ejs'); // Set EJS as view engine
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store: new FileStore(),
    secret: 'gulshan@123',
    resave: false,
    saveUninitialized: true
}));
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});
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

app.get('/movie/:id', function (req, res) {
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

app.post('/rate', (req, res) => {
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


app.get('/movies', (req, res) => {  // usage in search.js
    let movies = req.movies
    res.json(movies);
});

app.get('/search', (req, res) => {
    const query = req.query.q;
    const results = searchYourData(query);
    res.json(results);
});

app.get('/genre', (req, res) => {
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
    res.render('genre', { movies: filteredMovies, movieIndex: movieIndex, genre: genre });
    // res.render('genre', { movies: filteredMovies });

});

app.post('/handleSignup', (req, res) => {
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

app.post('/handleLogin', (req, res) => {
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

app.get('/recommend', (req, res) => {
    // pass the ./data/myratings.json file to the recommend.ejs file
    let myratings = JSON.parse(fs.readFileSync('./data/myratings.json', 'utf8'));
    res.render('recommend', { myratings: myratings, movies: req.movies});
});

app.get('/userRated', (req, res) => {
    let myratings = JSON.parse(fs.readFileSync('./data/myratings.json', 'utf8'));
    console.log(myratings[req.session.user.email][0].movie.Title);
    res.render('userRated', { myratings: myratings, movies: req.movies });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})