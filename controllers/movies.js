const MovieSchema = require('../models/Movie');
const Rating = require("../models/Rating");

module.exports.controller = app => {
    app.get('/movies', (req, res) => {
        MovieSchema.find({}, 'name description release_year genre', (error, movies) => {
            if (error) {
                console.log(`Error: ${error}`);
            }
            res.send({ movies, });
        });
    });

    app.get('/api/movies/:id', (req, res) => {
        MovieSchema.findById(req.params.id,
            'name description release_year genre', (error, movie) => {
                if (error) {
                    console.log(`Error: ${error}`);
                }
                res.send(movie);
            });
    });

    app.post('/movies/rate/:id', (req, res) => {
        const rating = new Rating({
            movie_id: req.params.id,
            user_id: req.body.user_id,
            rate: req.body.rate,
        });

        rating.save((error, rating) => {
            if (error) {
                console.log(`Error: ${error}`);
            }
            res.send({
                movie_id: rating.movie_id,
                user_id: rating.user_id,
                rate: rating.rate,
            });
        });
    });

    app.post('/movies', (req, res) => {
        const newMovie = new MovieSchema({
            name: req.body.name,
            description: req.body.description,
            release_year: req.body.release_year,
            genre: req.body.genre,
        });

        newMovie.save((error, movie) => {
            if (error) {
                console.log(`Error: ${error}`);
            }
            res.send(movie);
        });
    });
}