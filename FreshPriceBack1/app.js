const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const productsRoutes = require('./routes/products-routes');

const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use(cors());

require('./db/connect');

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      if (err) {
        console.log("unlink failed", err);
      } else {
        console.log("file deleted");
      }
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

try {
  app.listen(5000, () => {
    console.log("Server is running at port 5000");
  })
}
catch (err) {
  console.log(err);
}