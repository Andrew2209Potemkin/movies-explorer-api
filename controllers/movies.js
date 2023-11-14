const Movie = require('../models/movie');
const { STATUS_CODE_OBJECT_CREATED } = require('../utils/constants');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => {
      res.send(movies);
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration, year,
    description, image, trailerLink, nameRU,
    nameEN, thumbnail, movieId,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => res.status(STATUS_CODE_OBJECT_CREATED).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданы некорректные данные'));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  const { movieId } = req.params;

  Movie.findById(movieId)
    .orFail(() => { throw new NotFoundError('_id фильма не найден'); })
    .then((movie) => {
      if (movie.owner.toString() !== owner) {
        throw new ForbiddenError('Удаление чужого фильма невозможно');
      } else {
        Movie.findByIdAndDelete(movieId)
          .then((myMovie) => {
            res.send(myMovie);
          })
          .catch(next);
      }
    })
    .catch(next);
};
