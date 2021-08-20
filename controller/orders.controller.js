/* eslint-disable object-curly-newline */
const Order = require('../models/Order');

module.exports.createOrder = async (req, res, next) => {
  try {
    if (!Object.keys(req.body).length) return next(400);

    const { userId, client, products, status, dateProcessed } = req.body;

    const newOrder = new Order({ userId, client, products, status, dateProcessed });

    const orderSaved = await newOrder.save().then((model) => model.populate('userId', 'name').populate('products.product').execPopulate());

    res.status(201).json(orderSaved._doc);
  } catch (error) {
    next(500);
  }
};

module.exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('userId', 'name').populate('products.product');
    const status = orders.length ? 200 : 204;

    res.status(status).json(orders);
  } catch (error) {
    next(500);
  }
};

module.exports.getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('userId', 'name').populate('products.product');

    if (!order) return next(404);

    res.status(200).json(order);
  } catch (error) {
    next(500);
  }
};

module.exports.updateOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!Object.keys(req.body).length) return next(400);

    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true });

    if (!updatedOrder) return next(404);

    res.status(201).json(updatedOrder);
  } catch (error) {
    next(500);
  }
};

module.exports.deleteOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) return next(404);

    res.status(204).end();
  } catch (error) {
    next(500);
  }
};
