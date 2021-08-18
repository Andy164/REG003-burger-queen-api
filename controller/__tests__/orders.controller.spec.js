const config = require('../../config');

const { createOrder, getOrders, getOrderById, updateOrderById, deleteOrderById } = require('../orders.controller');

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

describe('Get Orders', () => {
  it('should get all orders', async () => {
    const req = mockRequest();

    const res = mockResponse();
    const next = mockNext;

    await getOrders(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
  });
});

describe('Get Order By Id', () => {
  it('should fail when no order', async () => {
    const req = mockRequest(
      {},
      {},
      {},
      {
        orderId: '611c776c17538a26b85e3740',
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await getOrderById(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(404);
  });
});
