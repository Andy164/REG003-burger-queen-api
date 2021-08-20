const config = require('../../config');

const { createOrder, getOrders, getOrderById, updateOrderById, deleteOrderById } = require('../orders.controller');
const { createUser } = require('../users.controller');
const { createProduct } = require('../products.controller');

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

let idUser;
let idProduct;
let idOrder;

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

describe('Create an Order', () => {
  it('should fail when no body', async () => {
    mockRequest.body = {};

    const res = mockResponse();

    await createOrder(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(400);
  });

  it('should create a user successfully', async () => {
    mockRequest.body = {
      username: 'Lola',
      name: 'Lola Díaz',
      email: 'lola@test.com',
      password: '12345678',
      roles: ['chef'],
    };

    const res = mockResponse();

    await createUser(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    idUser = value._id;

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('email', 'lola@test.com');
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

  it('should create an order successfully', async () => {
    mockRequest.body = {
      userId: idUser,
      client: 'Sharon Pérez',
      products: [{ product: idProduct, qty: 5 }],
      status: 'pending',
    };

    const res = mockResponse();

    await createOrder(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    idOrder = value._id;

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('client', 'Sharon Pérez');
  });
});

describe('Get Orders', () => {
  it('should get all orders', async () => {
    const res = mockResponse();

    await getOrders(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveLength(1);
  });
});

describe('Get Order By Id', () => {
  it('should fail when no order', async () => {
    mockRequest.params = {
      orderId: '611c776c17538a26b85e3740',
    };

    const res = mockResponse();

    await getOrderById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(404);
  });

  it('should get the order succesfully', async () => {
    mockRequest.params = {
      orderId: idOrder,
    };

    const res = mockResponse();

    await getOrderById(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('client', 'Sharon Pérez');
  });
});

describe('Update', () => {
  it('should fail when no body', async () => {
    mockRequest.body = {};

    mockRequest.params = {
      orderId: idOrder,
    };

    const res = mockResponse();

    await updateOrderById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(400);
  });

  it('should update the order', async () => {
    mockRequest.body = {
      status: 'preparing',
    };

    mockRequest.params = {
      orderId: idOrder,
    };

    const res = mockResponse();

    await updateOrderById(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('status', 'preparing');
  });
});

describe('Delete an order', () => {
  it('should fail when not found order', async () => {
    mockRequest.params = {
      orderId: '611c776c17538a26b85e3740',
    };

    const res = mockResponse();

    await deleteOrderById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(404);
  });

  it('should delete the order', async () => {
    mockRequest.params = {
      orderId: idOrder,
    };

    const res = mockResponse();

    await deleteOrderById(mockRequest, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledTimes(0);
  });
});
