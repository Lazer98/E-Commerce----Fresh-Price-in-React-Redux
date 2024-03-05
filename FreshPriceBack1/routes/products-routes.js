const express = require('express');
const { check } = require('express-validator');

const productsControllers = require('../controllers/products-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', productsControllers.getAllProducts);

router.get('/:pid', productsControllers.getProductById);

router.get('/place/:placeId', productsControllers.getProductsByPlaceId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('price')
      .not()
      .isEmpty(),
    check('discount')
      .not()
      .isEmpty()
  ],
  productsControllers.createProduct
);

router.patch(
  '/:pid',
  [
    check('name')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('price')
      .not()
      .isEmpty()
  ],
  productsControllers.updateProduct
);

router.delete('/:pid', productsControllers.deleteProduct);

module.exports = router;
