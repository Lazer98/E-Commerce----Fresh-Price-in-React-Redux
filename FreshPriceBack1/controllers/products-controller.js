const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Product = require('../models/product');
const Place = require('../models/place');

const getAllProducts = async (req, res, next) => {

  let product;
  try {
    product = await Product.find();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a product.',
      500
    );
    return next(error);
  }

  res.json({ product: product.toObject({ getters: true }) });
};

const getProductById = async (req, res, next) => {
  const productId = req.params.pid;

  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a product.',
      500
    );
    return next(error);
  }

  if (!product) {
    const error = new HttpError(
      'Could not find product for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ product: product.toObject({ getters: true }) });
};

const getProductsByPlaceId = async (req, res, next) => {
  const placeId = req.params.placeId;
 
  // let products;
  let placeWithProducts;
  try {
    
    placeWithProducts = await Place.findById(placeId).populate('products');
    //console.log("PLACEWITHPRODUCTS "+placeWithProducts);
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!placeWithProducts ) { //|| placeWithProducts.products.length === 0
    return next(
      new HttpError('Could not find products for the provided place id.', 404)
    );
  }
 
  res.json({
     products: placeWithProducts.products.map(product =>
         product.toObject({ getters: true })
    )
  });
};

const createProduct = async (req, res, next) => {
  //const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return next(
  //     new HttpError('Invalid inputs passed, please check your data.', 422)
  //   );
  // }
 
  const { name, description, price ,discount,creator,creatorUser} = req.body;
  let newPrice= defineNewPrice(price,discount);
  console.log(newPrice);

  const createdProduct = new Product({
    name,
    description,
    price,
    image: req.file.path,
    discount,
    newPrice,
    creator,
    creatorUser
  });
 
 
  let place;
  try {
    place = await Place.findById(creator);
   
  } catch (err) {
    const error = new HttpError(
      'Creating product failed, please try again.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for provided id.', 404);
    return next(error);
  }
  
 
    try {
    createdProduct.save();
    place.products.push(createdProduct);
    place.save();

  } catch (err) {
    const error = new HttpError(
      'Creating product failed, please try again.BACK',
      500
    );
    return next(error);
  }


  res.status(201).json({ product: createdProduct });
};

const updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, description,price,discount } = req.body;
  const productId = req.params.pid;
  const newPrice= defineNewPrice(price,discount);

  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update product.',
      500
    );
    return next(error);
  }

  //   if (product.creator.toString() !== req.placeData.placeId) {
  //   const error = new HttpError('You are not allowed to edit this place.', 401);
  //   return next(error);
  // }

  product.name = name;
  product.description = description;
  product.price = price;
  product.discount = discount;
  product.newPrice= newPrice;
  
  try {
    await product.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update product.',
      500
    );
    return next(error);
  }
  console.log(product);
  res.status(200).json({ product: product.toObject({ getters: true }) });
};

const deleteProduct = async (req, res, next) => {
   const productId = req.params.pid;

  let product;
  try {
    product = await Product.findById(productId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete product.',
      500
    );
    return next(error);
  }

  if (!product) {
    const error = new HttpError('Could not find product for this id.', 404);
    return next(error);
  }

  // if (product.creator.id !== req.placeData.placeId) {
  //   const error = new HttpError(
  //     'You are not allowed to delete this place.',
  //     401
  //   );
  //   return next(error);
  // }

  const imagePath = product.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await product.remove({ session: sess });
    product.creator.products.pull(product);
    await product.creator.save({ session: sess });
    await sess.commitTransaction();
    // product.remove({});
    // product.creator.products.pull(product);
    // product.creator.save({});
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete product.',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted product.' });
};

const defineNewPrice = (price,discount) => {
  let newPrice= (price/100)*discount;
  newPrice= price-newPrice;
  return newPrice;
}


exports.getProductById = getProductById;
exports.getProductsByPlaceId = getProductsByPlaceId;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.getAllProducts = getAllProducts;
