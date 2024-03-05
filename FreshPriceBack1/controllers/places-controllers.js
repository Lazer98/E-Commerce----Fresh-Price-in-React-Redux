const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const Product = require('../models/product');

const getAllPlaces = async(req, res ,next) => {

  let places;
    try {
      places= await Place.find();
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not find a Stores.',
         500
      );
      return next(error);
    }
    
    res.json({ places: places.map(place => place.toObject({ getters: true })) });
  };


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find place for the provided id.',
      404
    );
    return next(error);
  }
  console.log(place);
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithPlaces;
  try {
    
    userWithPlaces = await User.findById(userId).populate('places');
    //console.log(userWithPlaces);
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!userWithPlaces ) { //|| userWithPlaces.places.length === 0
    console.log("error foundBACK");
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

const createPlace = async (req, res, next) => {
  //const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return next(
  //     new HttpError('Invalid inputs passed, please check your data.', 422)
  //   );
  // }
  console.log("req:",req);
  const { title, description, address,user_id } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
    console.log("coordinates:",coordinates);
  } catch (error) {
    return next(error);
  }
  console.log(user_id);
  let creator_id='';
  if(user_id!='test'){
    creator_id =user_id;
  }
  else {
    creator_id = req.userData.userId;
  }

  console.log(creator_id);
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: creator_id
  });
  
  
  let user;
  try {
    user = await User.findById(creator_id);

  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }
  
  
    //const sess = await mongoose.startSession();
    //sess.startTransaction();
    //console.log("sess:",sess);
    try {
    //await createdPlace.save({ session: sess });
    createdPlace.save();
    user.places.push(createdPlace);
    //await user.save({ session: sess });
    user.save();
    //await sess.commitTransaction();

  } catch (err) {
    console.log("err:",err);
    //await sess.abortTransaction();
    const error = new HttpError(
      'Creating place failed, please try again.BACK',
      500
    );
    return next(error);
  }


  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }
  
  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this place.', 401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }
  //check if is admin or the user himself
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    console.log(err);
  }
  
  if ((place.creator.id !== req.userData.userId) && (user.role!=="admin")) {
    const error = new HttpError(
      'You are not allowed to delete this place.',
      401
    );
    return next(error);
  }

  const imagePath = place.image;
  //delete all connected products before
  let products;
  try {
    products = await Product.find();
  } catch (err) {
    console.log(err);
  }
   products.forEach(product => {
    if(product.creator == req.params.pid){
            product.remove({});
          }
   });
  

  try {
    // const sess = await mongoose.startSession();
    // sess.startTransaction();
    // await place.remove({ session: sess });
    // place.creator.places.pull(place);
    // await place.creator.save({ session: sess });
    // await sess.commitTransaction();
    place.remove({});
    place.creator.places.pull(place);
    place.creator.save({});
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.getAllPlaces = getAllPlaces;
