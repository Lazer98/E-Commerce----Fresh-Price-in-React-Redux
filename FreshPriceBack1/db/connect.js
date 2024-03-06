const mongoose = require('mongoose');
const { mongoDBURL } = require('../config');


mongoose.connect(
  mongoDBURL,
  { retryWrites: false, useNewUrlParser: true, useUnifiedTopology: true }
)
.catch(err => {
  console.log(err);
});