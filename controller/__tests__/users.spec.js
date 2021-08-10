// const { createUser } = require('../users.controller');
const request = require('supertest');

const { app } = require('../../index');
const { connect, closeDatabase } = require('../../libs/db-config');

let server;

beforeAll(async () => {
  // TODO Iniciar server
  await connect();
});

afterAll(async () => {
  await closeDatabase();
  server.close();
});

describe('getUsers', () => {
  it('should create new auth token and allow access using it', async () => {
    const res = await (
      await request(app).post('/users')
    ).send({
      username: 'Admin4',
      name: 'Admin Test 4',
      email: 'admin4@ejemplo.com',
      password: '12345678',
      roles: ['admin'],
    });

    expect(res.status).toEqual(200);
    expect(res.json.roles.length).toBeGreaterThan(0);
    expect(res.json.name).toBe('Admin Test 4');
  });
});
