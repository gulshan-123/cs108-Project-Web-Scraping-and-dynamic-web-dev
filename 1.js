const express = require('express')
const fs = require('fs');
const app = express()
const session = require('express-session');
const port = 3000

app.set('view engine', 'ejs'); // Set EJS as view engine
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if your using https
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
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
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

app.post('/rate', (req, res) => {
    let movies = req.movies;

    let rating = req.body.rating;
    let movieIndex = req.body.movieIndex;
    console.log(movieIndex);
    console.log(movies[movieIndex]);
    let movie = movies[movieIndex];
    // Save the rating to a JSON file
    fs.readFile('./data/myratings.json', 'utf8', (err, data) => {
        if (err) throw err;
      
        // Parse the data into a JavaScript object
        let ratings = JSON.parse(data);
      
        // Check if the email already exists
        if (ratings[req.session.user.email]) {
          // If the email exists, update the existing entry
          ratings[req.session.user.email].push({ movie: movie, myrating: rating });
        } else {
          // If the email doesn't exist, create a new entry
          ratings[req.session.user.email] = [{ movie: movie, myrating: rating }];
        }
      
        // Write the updated data back to the file
        fs.writeFile('./data/myratings.json', JSON.stringify(ratings), (err) => {
          if (err) throw err;
          res.json({ status: 'success' });
        });
      });
  });
    

app.get('/movies', (req, res) => {
    let movies=req.movies
    res.json(movies);
});

app.get('/search', (req, res) => {
    const query = req.query.q;
    const results = searchYourData(query);
    res.json(results);
});

app.get('/genre', (req, res) => {
    let movies = req.movies;

    const genre = req.query.genre.replace(/\b\w/g, function(char) {
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
    res.render('genre', { movies: filteredMovies, movieIndex: movieIndex, genre: genre});
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
                <p>Email already exists. You will be redirected in 3 seconds...</p>
                <script>
                    setTimeout(function() {
                        window.location.href = '/signup';
                    }, 3000);
                </script>
            `);
        }

        users.push({ email, password });

        fs.writeFile('./data/users.json', JSON.stringify(users), (err) => {
            if (err) throw err;

            res.send(`
                <p>Signup successful. You will be redirected in 3 seconds...</p>
                <script>
                    setTimeout(function() {
                        window.location.href = '/';
                    }, 3000);
                </script>
            `);
        });
    });
});

app.post('/handleLogin', (req, res) => {
    if (req.session.user) {
        return res.send(`
            <p>You are already logged in. You will be redirected in 2 seconds...</p>
            <script>
                setTimeout(function() {
                    window.location.href = '/';
                }, 2000);
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
            <p>No user found with this email. Sign Up first. You will be redirected in 3 seconds...</p>
            <script>
                setTimeout(function() {
                    window.location.href = '/signup';
                }, 3000);
            </script>
        `);
        }

        if (user.password !== password) {
            return res.send(`
            <p>Incorrect Password !!! You will be redirected in 3 seconds...</p>
            <script>
                setTimeout(function() {
                    window.location.href = '/login';
                }, 3000);
            </script>
        `);
        }
        req.session.user = user; // it will create a session object for the user and store the user object in it, so that we can access it in other routes

        res.send(`
        <p>Login Successful... You will be redirected in 3 seconds...</p>
        <script>
            setTimeout(function() {
                window.location.href = '/';
            }, 3000);
        </script>
    `);
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})