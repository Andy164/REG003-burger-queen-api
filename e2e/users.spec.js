const url = require('url');
const qs = require('querystring');
const config = require('../config');

const { fetch, fetchAsTestUser, fetchAsAdmin, fetchWithAuth } = process;

const parseLinkHeader = (str) =>
  str.split(',').reduce((memo, item) => {
    const [, value, key] = /^<(.*)>;\s+rel="(first|last|prev|next)"/.exec(item.trim());
    return { ...memo, [key]: value };
  }, {});

describe('GET /users', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/users').then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 403 when not admin', (done) => {
    fetchAsTestUser('/users').then((resp) => {
      expect(resp.status).toBe(403);
      done();
    });
  });

  it('should get users', (done) => {
    fetchAsAdmin('/users')
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(Array.isArray(json)).toBe(true);
        expect(json.length > 0).toBe(true);
        done();
      });
  });

  it('should get users with pagination', () =>
    fetchAsAdmin('/users?limit=1')
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json().then((json) => ({ headers: resp.headers, json }));
      })
      .then(({ headers, json }) => {
        const linkHeader = parseLinkHeader(headers.get('link'));

        const nextUrlObj = url.parse(linkHeader.next);
        const lastUrlObj = url.parse(linkHeader.last);
        const nextQuery = qs.parse(nextUrlObj.query);
        const lastQuery = qs.parse(lastUrlObj.query);

        expect(nextQuery.limit).toBe('1');
        expect(nextQuery.page).toBe('2');
        expect(lastQuery.limit).toBe('1');
        expect(lastQuery.page >= 2).toBe(true);

        expect(Array.isArray(json)).toBe(true);
        expect(json.length).toBe(1);
        expect(json[0]).toHaveProperty('_id');
        expect(json[0]).toHaveProperty('email');
        return fetchAsAdmin(nextUrlObj.path);
      })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json().then((json) => ({ headers: resp.headers, json }));
      })
      .then(({ headers, json }) => {
        const linkHeader = parseLinkHeader(headers.get('link'));

        const firstUrlObj = url.parse(linkHeader.first);
        const prevUrlObj = url.parse(linkHeader.prev);

        const firstQuery = qs.parse(firstUrlObj.query);
        const prevQuery = qs.parse(prevUrlObj.query);

        expect(firstQuery.limit).toBe('1');
        expect(firstQuery.page).toBe('1');
        expect(prevQuery.limit).toBe('1');
        expect(prevQuery.page).toBe('1');

        expect(Array.isArray(json)).toBe(true);
        expect(json.length).toBe(1);
        expect(json[0]).toHaveProperty('_id');
        expect(json[0]).toHaveProperty('email');
      }));
});

describe('GET /users/:uid', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/users/foo@bar.baz').then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 403 when not owner nor admin', (done) => {
    fetchAsTestUser(`/users/${config.adminEmail}`).then((resp) => {
      expect(resp.status).toBe(403);
      done();
    });
  });

  it('should fail with 404 when admin and not found', (done) => {
    fetchAsAdmin('/users/abc@def.ghi').then((resp) => {
      expect(resp.status).toBe(404);
      done();
    });
  });

  it('should get own user', (done) => {
    fetchAsTestUser('/users/test@test.co')
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.email).toBe('test@test.co');
        done();
      });
  });

  it('should get other user as admin', (done) => {
    fetchAsAdmin('/users/test@test.co')
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.email).toBe('test@test.co');
        done();
      });
  });
});

describe('POST /users', () => {
  it('should respond with 400 when email and password missing', (done) => {
    fetchAsAdmin('/users', { method: 'POST' }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it('should respond with 400 when email is missing', (done) => {
    fetchAsAdmin('/users', { method: 'POST', body: { email: '', password: 'xxxx' } }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it('should respond with 400 when password is missing', (done) => {
    fetchAsAdmin('/users', { method: 'POST', body: { email: 'foo@bar.baz' } }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it('should fail with 400 when invalid email', (done) => {
    fetchAsAdmin('/users', { method: 'POST', body: { email: 'failemail', password: '123456' } }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it('should fail with 400 when invalid password', (done) => {
    fetchAsAdmin('/users', { method: 'POST', body: { email: 'email@test.tes', password: '12' } }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it.skip('should create new user', (done) => {
    fetchAsAdmin('/users', {
      method: 'POST',
      body: {
        username: 'TestUser2',
        name: 'User Test 2',
        email: 'test1@test.test',
        password: '1234567',
        roles: ['chef'],
      },
    })
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => {
        expect(typeof json._id).toBe('string');
        expect(typeof json.email).toBe('string');
        expect(typeof json.password).toBe('undefined');
        expect(typeof json.roles).toBe('object');
        expect(json.roles.length).toBe(1);
        done();
      });
  });

  it.skip('should create new admin user', (done) => {
    fetchAsAdmin('/users', {
      method: 'POST',
      body: {
        username: 'admin1',
        name: 'Administrator1',
        email: 'admin1@test.test',
        password: '12345678',
        roles: ['admin'],
      },
    })
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => {
        expect(typeof json._id).toBe('string');
        expect(typeof json.email).toBe('string');
        expect(typeof json.password).toBe('undefined');
        expect(typeof json.roles).toBe('object');
        // expect(json.roles.admin).toBe(true);
        done();
      });
  });

  it('should fail with 403 when user is already registered', (done) => {
    fetchAsAdmin('/users', {
      method: 'POST',
      body: {
        username: 'TestUser',
        name: 'User Test',
        email: 'test@test.co',
        password: '12345679',
        roles: ['chef'],
      },
    }).then((resp) => {
      expect(resp.status).toBe(403);
      done();
    });
  });
});

describe('PUT /users/:uid', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/users/foo@bar.baz', { method: 'PUT' }).then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 403 when not owner nor admin', (done) => {
    fetchAsTestUser(`/users/${config.adminEmail}`, { method: 'PUT' }).then((resp) => {
      expect(resp.status).toBe(403);
      done();
    });
  });

  it('should fail with 404 when admin and not found', (done) => {
    fetchAsAdmin('/users/abc@def.gih', {
      method: 'PUT',
      body: { name: 'Test User' },
    }).then((resp) => {
      expect(resp.status).toBe(404);
      done();
    });
  });

  it('should fail with 400 when no props to update', (done) => {
    fetchAsTestUser('/users/test@test.co', { method: 'PUT' }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it('should fail with 403 when not admin tries to change own roles', (done) => {
    fetchAsTestUser('/users/test@test.co', {
      method: 'PUT',
      body: { roles: ['admin'] },
    }).then((resp) => {
      expect(resp.status).toBe(403);
      done();
    });
  });

  it('should update user when own data (password change)', (done) => {
    fetchAsTestUser('/users/test@test.co', {
      method: 'PUT',
      body: { password: 'garmadon' },
    })
      .then((resp) => {
        expect(resp.status).toBe(201);
      })
      .then(() =>
        fetch('/auth', {
          method: 'POST',
          body: { email: 'test@test.co', password: 'garmadon' },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => {
        expect(json).toHaveProperty('token');
        done();
      });
  });

  it('should update user when admin', (done) => {
    fetchAsAdmin('/users/test@test.co', {
      method: 'PUT',
      body: { password: 'ohmygod' },
    })
      .then((resp) => expect(resp.status).toBe(201))
      .then(() =>
        fetch('/auth', {
          method: 'POST',
          body: { email: 'test@test.co', password: 'ohmygod' },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => {
        expect(json).toHaveProperty('token');
        done();
      });
  });
});

describe('DELETE /users/:uid', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/users/foo@bar.baz', { method: 'DELETE' }).then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 403 when not owner nor admin', (done) => {
    fetchAsTestUser(`/users/${config.adminEmail}`, { method: 'DELETE' }).then((resp) => {
      expect(resp.status).toBe(403);
      done();
    });
  });

  it('should fail with 404 when admin and not found', (done) => {
    fetchAsAdmin('/users/abc@def.ghi', { method: 'DELETE' }).then((resp) => {
      expect(resp.status).toBe(404);
      done();
    });
  });

  it('should delete own user', (done) => {
    const credentials = {
      username: 'TestUser3',
      name: 'Test User 3',
      email: `foo-bar@bar.baz`,
      password: '12345678',
      roles: ['waiter'],
    };

    fetchAsAdmin('/users', { method: 'POST', body: credentials })
      .then((resp) => expect(resp.status).toBe(201))
      .then(() =>
        fetch('/auth', {
          method: 'POST',
          body: {
            email: credentials.email,
            password: credentials.password,
          },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then(({ token }) =>
        fetchWithAuth(token)(`/users/${credentials.email}`, {
          method: 'DELETE',
        })
      )
      .then((resp) => expect(resp.status).toBe(204))
      .then(() => fetchAsAdmin(`/users/${credentials.email}`))
      .then((resp) => {
        expect(resp.status).toBe(404);
        done();
      });
  });

  it('should delete other user as admin', (done) => {
    const credentials = {
      username: 'TestUser3',
      name: 'Test User 3',
      email: `foo-bar@bar.baz`,
      password: '12345678',
      roles: ['waiter'],
    };

    fetchAsAdmin('/users', { method: 'POST', body: credentials })
      .then((resp) => expect(resp.status).toBe(201))
      .then(() => fetchAsAdmin(`/users/${credentials.email}`, { method: 'DELETE' }))
      .then((resp) => expect(resp.status).toBe(204))
      .then(() => fetchAsAdmin(`/users/${credentials.email}`))
      .then((resp) => {
        expect(resp.status).toBe(404);
        done();
      });
  });
});
