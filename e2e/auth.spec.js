const { fetch, fetchWithAuth } = process;

const config = require('../config');

describe('POST /auth', () => {
  it('should respond with 400 when email and password missing', (done) => {
    fetch('/auth', { method: 'POST' }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it('should respond with 400 when email is missing', (done) => {
    fetch('/auth', {
      method: 'POST',
      body: { email: '', password: 'xxxx' },
    }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it('should respond with 400 when password is missing', (done) => {
    fetch('/auth', {
      method: 'POST',
      body: { email: 'foo@bar.baz' },
    }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it('fail with 404 credentials dont match', (done) => {
    fetch('/auth', {
      method: 'POST',
      body: { email: `foo-${Date.now()}@bar.baz`, password: 'xxxx' },
    }).then((resp) => {
      expect(resp.status).toBe(404);
      done();
    });
  });

  it('should create new auth token and allow access using it', (done) => {
    fetch('/auth', {
      method: 'POST',
      body: { email: config.adminEmail, password: config.adminPassword },
    })
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then(({ token }) => fetchWithAuth(token)(`/users/${config.adminEmail}`))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.email).toBe(config.adminEmail);
        done();
      });
  });
});
