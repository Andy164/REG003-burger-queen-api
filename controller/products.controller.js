/* eslint-disable object-curly-newline */
const Product = require('../models/Product');

module.exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, image, category, type } = req.body;

    const productByName = await Product.findOne({ name });

    if (productByName) return next(403);

    const newProduct = new Product({ name, price, image, category, type });
    const productSaved = await newProduct.save();

    // TODO Read about status and statusCode
    res.status(201).json(productSaved._doc);
  } catch (error) {
    next(500);
  }
};

module.exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    const status = products.length ? 200 : 204;

    res.status(status).json(products);
  } catch (error) {
    next(500);
  }
};

module.exports.getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) return next(404);

    res.status(200).json(product);
  } catch (error) {
    next(500);
  }
};

module.exports.updateProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!Object.keys(req.body).length) return next(400);

    const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true });

    if (!updatedProduct) return next(404);

    res.status(201).json(updatedProduct);
  } catch (error) {
    next(500);
  }
};

module.exports.deleteProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) return next(404);

    res.status(204).end();
  } catch (error) {
    next(500);
  }
};

// TODO Buscar diferencia entre delete y remove
