const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places.route');
const usersRoutes = require('./routes/users.route');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  next(new HttpError('Could not find this route', 404));
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred' });
});

mongoose
  .connect(
    'mongodb+srv://admin:admin@cluster0.dkvbydh.mongodb.net/places-api-db?retryWrites=true&w=majority'
  )
  .then(() => {
    app.listen(500);
  })
  .catch((error) => {
    console.log(error);
  });
