const { fetch, fetchAsTestUser, fetchAsAdmin } = process;

describe.skip('POST /products', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/products', { method: 'POST' }).then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 403 when not admin', (done) => {
    fetchAsTestUser('/products', { method: 'POST' }).then((resp) => {
      expect(resp.status).toBe(403);
      done();
    });
  });

  it('should fail with 400 when bad props', (done) => {
    fetchAsAdmin('/products', { method: 'POST' }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it('should create product as admin', (done) => {
    fetchAsAdmin('/products', {
      method: 'POST',
      body: {
        name: 'Test',
        price: 5,
        image: 'url_image',
        category: 'Breakfast',
        type: 'Side dishes',
      },
    })
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => {
        expect(typeof json._id).toBe('string');
        expect(typeof json.name).toBe('string');
        expect(typeof json.price).toBe('number');
        done();
      });
  });
});

describe.skip('GET /products', () => {
  it('should get products with Auth', (done) => {
    fetchAsTestUser('/products')
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(Array.isArray(json)).toBe(true);
        json.forEach((product) => {
          expect(typeof product._id).toBe('string');
          expect(typeof product.name).toBe('string');
          expect(typeof product.price).toBe('number');
          done();
        });
      });
  });
});

describe.skip('GET /products/:productid', () => {
  it('should get product with Auth', (done) => {
    fetchAsTestUser('/products')
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(Array.isArray(json)).toBe(true);
        expect(json.length > 0).toBe(true);
        json.forEach((product) => {
          expect(typeof product._id).toBe('string');
          expect(typeof product.name).toBe('string');
          expect(typeof product.price).toBe('number');
        });
        return fetchAsTestUser(`/products/${json[0]._id}`).then((resp) => ({ resp, product: json[0] }));
      })
      .then(({ resp, product }) => {
        expect(resp.status).toBe(200);
        return resp.json().then((json) => ({ json, product }));
      })
      .then(({ json, product }) => {
        expect(json).toEqual(product);
        done();
      });
  });

  it('should fail with 404 when not found', (done) => {
    fetchAsTestUser('/products/6111d3105ae7c60e1059b26d').then((resp) => {
      expect(resp.status).toBe(404);
      done();
    });
  });
});

describe.skip('PUT /products/:productid', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/products/6111d3105ae7c60e1059b26d', { method: 'PUT' }).then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 403 when not admin', (done) => {
    fetchAsAdmin('/products', {
      method: 'POST',
      body: {
        name: 'Product 2',
        price: 5,
        image: 'url_image',
        category: 'Breakfast',
        type: 'Side dishes',
      },
    })
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) =>
        fetchAsTestUser(`/products/${json._id}`, {
          method: 'PUT',
          body: { price: 20 },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(403);
        done();
      });
  });

  it('should fail with 404 when admin and not found', (done) => {
    fetchAsAdmin('/products/6111d3105ae7c60e1059b26d', {
      method: 'PUT',
      body: { price: 1 },
    }).then((resp) => {
      expect(resp.status).toBe(404);
      done();
    });
  });

  it('should fail with 400 when bad props', (done) => {
    fetchAsAdmin('/products', {
      method: 'POST',
      body: {
        name: 'Product 3',
        price: 5,
        image: 'url_image',
        category: 'Breakfast',
        type: 'Side dishes',
      },
    })
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) =>
        fetchAsAdmin(`/products/${json._id}`, {
          method: 'PUT',
          body: { price: 'abc' },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(400);
        done();
      });
  });

  it('should update product as admin', (done) => {
    fetchAsAdmin('/products', {
      method: 'POST',
      body: {
        name: 'Product 4',
        price: 5,
        image: 'url_image',
        category: 'Breakfast',
        type: 'Side dishes',
      },
    })
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) =>
        fetchAsAdmin(`/products/${json._id}`, {
          method: 'PUT',
          body: { price: 20 },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => {
        expect(json.price).toBe(20);
        done();
      });
  });
});

describe.skip('DELETE /products/:productid', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/products/6111d3105ae7c60e1059b26d', { method: 'DELETE' }).then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 403 when not admin', (done) => {
    fetchAsAdmin('/products', {
      method: 'POST',
      body: {
        name: 'Product 5',
        price: 5,
        image: 'url_image',
        category: 'Breakfast',
        type: 'Side dishes',
      },
    })
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => fetchAsTestUser(`/products/${json._id}`, { method: 'DELETE' }))
      .then((resp) => {
        expect(resp.status).toBe(403);
        done();
      });
  });

  it('should fail with 404 when admin and not found', (done) => {
    fetchAsAdmin('/products/6111d3105ae7c60e1059b26d', { method: 'DELETE' }).then((resp) => {
      expect(resp.status).toBe(404);
      done();
    });
  });

  it('should delete other product as admin', (done) => {
    fetchAsAdmin('/products', {
      method: 'POST',
      body: {
        name: 'Product 6',
        price: 5,
        image: 'url_image',
        category: 'Breakfast',
        type: 'Side dishes',
      },
    })
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then(({ _id }) => fetchAsAdmin(`/products/${_id}`, { method: 'DELETE' }).then((resp) => ({ resp, _id })))
      .then(({ resp, _id }) => {
        expect(resp.status).toBe(204);
        return fetchAsAdmin(`/products/${_id}`);
      })
      .then((resp) => {
        expect(resp.status).toBe(404);
        done();
      });
  });
});
