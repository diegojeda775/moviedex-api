require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const MOVIEDEX = require('./moviedex.json');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
})

function handleGetMovie(req, res){
    const { genre = "", country = "", avg_vote } = req.query;
    const vote = parseFloat(avg_vote);

    if(vote){
        if(isNaN(vote) || vote < 0) {
            return res.status(400).send("Avg vote should be a positive number");
        } 
    }

    let results = MOVIEDEX.filter(movie => movie.genre.toLocaleLowerCase().includes(genre.toLocaleLowerCase()));

    results = results.filter(movie => movie.country.toLocaleLowerCase().includes(country.toLocaleLowerCase()));

    if(vote >= 0){
        results = results
            .filter(movie => movie.avg_vote >= vote)
            .sort((a, b) => b.avg_vote < a.avg_vote ? -1 : 1);
    }

    res.json(results);

}

app.get('/movie', handleGetMovie);

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});