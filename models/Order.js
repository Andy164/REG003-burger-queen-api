const { Schema, model } = require('mongoose');

// TODO Fix products field: Product can be a ref
// TODO Check about relations

const orderSchema = new Schema(
  {
    userId: {
      ref: 'User',
      type: Schema.Types.ObjectId,
    },
    client: {
      type: String,
      required: true,
      trim: true,
    },
    products: [
      {
        product: {
          ref: 'Product',
          type: Schema.Types.ObjectId,
        },
        qty: {
          type: Number,
          required: true,
          trim: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'preparing', 'delivering', 'delivered', 'canceled'],
      default: 'pending',
    },
    dateProcessed: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    // versionKey: false,
    // eslint-disable-next-line comma-dangle
  }
);

module.exports = model('Order', orderSchema);
