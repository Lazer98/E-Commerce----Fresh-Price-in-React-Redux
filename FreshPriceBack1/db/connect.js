const mongoose = require('mongoose');

const URL = "mongodb+srv://LazerMendi:1234@cluster0.alrk9.mongodb.net/TestProject";

mongoose
  .connect(
    URL
    , {retryWrites:false,useNewUrlParser: true, useUnifiedTopology: true}
  )
  .catch(err => {
    console.log(err);
  });