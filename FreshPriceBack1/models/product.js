const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  newPrice : { type: Number, required: true },
  creator: { type: mongoose.Types.ObjectId,  ref: 'Place' }, //required:true
  creatorUser:{ type: mongoose.Types.ObjectId,  ref: 'User' }
});

module.exports = mongoose.model('Product', productSchema);
