const config = require('../../config');

const { createProduct, getProducts, getProductById, updateProductById, deleteProductById } = require('../products.controller');

const { initRoles, initAdminUser } = require('../../libs/initialSetup');
const { connect, closeDatabase } = require('../../libs/db-config');

const mockRequest = {};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockImplementation((info) => info);
  return res;
};

const mockNext = jest.fn().mockImplementation((err) => err);

const app = {
  get: jest.fn().mockImplementation(() => ({ adminEmail: config.adminEmail, adminPassword: config.adminPassword })),
};

let idProduct;

// Connect to a new in-memory database before running any tests.
beforeAll(async () => {
  await connect();

  await initRoles();
  await initAdminUser(app);
});

// Remove and close the db and server.
afterAll(async () => {
  await closeDatabase();
});

describe('Create an Product', () => {
  it('should fail when no body', async () => {
    mockRequest.body = {};

    const res = mockResponse();

    await createProduct(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(400);
  });

  it('should create a product successfully', async () => {
    mockRequest.body = {
      name: 'Test 10',
      price: 10,
      image: 'url_image',
      category: 'Breakfast',
      type: 'Side dishes',
    };

    const res = mockResponse();

    await createProduct(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    idProduct = value._id;

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('category', 'Breakfast');
  });
});

describe('Get Products', () => {
  it('should get all products', async () => {
    const res = mockResponse();

    await getProducts(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveLength(1);
  });
});

describe('Get Product By Id', () => {
  it('should fail when no product', async () => {
    mockRequest.params = {
      productId: '611c776c17538a26b85e3740',
    };

    const res = mockResponse();

    await getProductById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(404);
  });

  it('should get the product succesfully', async () => {
    mockRequest.params = {
      productId: idProduct,
    };

    const res = mockResponse();

    await getProductById(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('name', 'Test 10');
  });
});

describe('Update', () => {
  it('should fail when no body', async () => {
    mockRequest.body = {};

    mockRequest.params = {
      productId: idProduct,
    };

    const res = mockResponse();

    await updateProductById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(400);
  });

  it('should update the product', async () => {
    mockRequest.body = {
      price: 20,
    };

    mockRequest.params = {
      productId: idProduct,
    };

    const res = mockResponse();

    await updateProductById(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('price', 20);
  });
});

describe('Delete an product', () => {
  it('should fail when not found product', async () => {
    mockRequest.params = {
      productId: '611c776c17538a26b85e3740',
    };

    const res = mockResponse();

    await deleteProductById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(404);
  });

  it('should delete the product', async () => {
    mockRequest.params = {
      productId: idProduct,
    };

    const res = mockResponse();

    await deleteProductById(mockRequest, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledTimes(0);
  });
});
