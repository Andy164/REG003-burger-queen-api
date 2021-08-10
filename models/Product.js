const { Schema, model } = require('mongoose');

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Dinner'],
    },
    type: {
      type: String,
      enum: ['Burger', 'Side dishes', 'Drinks'],
    },
  },
  {
    timestamps: true,
    // eslint-disable-next-line comma-dangle
  }
);

module.exports = model('Product', productSchema);
