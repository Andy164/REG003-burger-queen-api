const config = require('../../config');

const { createProduct, getProducts, getProductById, updateProductById, deleteProductById } = require('../products.controller');

const { initRoles, initAdminUser } = require('../../libs/initialSetup');
const { connect, closeDatabase } = require('../../testSetup/db-config');

const mockRequest = (body, query, userInfo, params) => ({
  body,
  query,
  userInfo,
  params,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn().mockImplementation((err) => err);

const app = {
  get: jest.fn().mockImplementation(() => ({ adminEmail: config.adminEmail, adminPassword: config.adminPassword })),
};

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

describe('Create a Product', () => {
  it('should create a product successfully', async () => {
    const req = mockRequest({
      name: 'Coffee',
      price: '1.5',
      image: 'string',
      category: 'Breakfast',
      type: 'Drinks',
    });

    const res = mockResponse();
    const next = mockNext;

    await createProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('should not create a product if record already exists', async () => {
    const req = mockRequest({
      name: 'Coffee',
      price: '1.5',
      image: 'string',
      category: 'Breakfast',
      type: 'Drinks',
    });

    const res = mockResponse();
    const next = mockNext;

    await createProduct(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(403);
  });
});

describe('Get Products', () => {
  it('should get all products', async () => {
    const req = mockRequest();

    const res = mockResponse();
    const next = mockNext;

    await getProducts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    // expect(res.json).toHaveLength(1);
  });
});

describe('Get Product By Id', () => {
  it('should fail when no product', async () => {
    const req = mockRequest(
      {},
      {},
      {},
      {
        productId: '611c776c17538a26b85e3740',
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await getProductById(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(404);
  });
});
