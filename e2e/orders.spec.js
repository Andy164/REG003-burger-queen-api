const { fetch, fetchAsTestUser, fetchAsAdmin } = process;

describe('POST /orders', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/orders', { method: 'POST' }).then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 400 when bad props', (done) => {
    fetchAsTestUser('/orders', { method: 'POST', body: {} }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  it('should fail with 400 when empty items', (done) => {
    fetchAsTestUser('/orders', {
      method: 'POST',
      body: { products: [] },
    }).then((resp) => {
      expect(resp.status).toBe(400);
      done();
    });
  });

  // should create order as user (own order)
  it('should create order as waiter', (done) => {
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: {
          name: 'Test 10',
          price: 10,
          image: 'url_image',
          category: 'Breakfast',
          type: 'Side dishes',
        },
      }),
      fetchAsTestUser('/users/test@test.co'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(201);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) =>
        fetchAsTestUser('/orders', {
          method: 'POST',
          body: {
            userId: user._id,
            client: 'client',
            products: [{ product: product._id, qty: 5 }],
            status: 'pending',
          },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => {
        expect(typeof json._id).toBe('string');
        expect(json.client).toBe('client');
        expect(typeof json.dateProcessed).toBe('string');
        expect(Array.isArray(json.products)).toBe(true);
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('Test 10');
        expect(json.products[0].product.price).toBe(10);
        done();
      });
  });

  // it.skip('should create order as admin', (done) => {
  //   Promise.all([
  //     fetchAsAdmin('/products', {
  //       method: 'POST',
  //       body: { name: 'Test', price: 25 },
  //     }),
  //     fetchAsTestUser('/users/test@test.co'),
  //   ])
  //     .then((responses) => {
  //       expect(responses[0].status).toBe(200);
  //       expect(responses[1].status).toBe(200);
  //       return Promise.all([responses[0].json(), responses[1].json()]);
  //     })
  //     .then(([product, user]) =>
  //       fetchAsAdmin('/orders', {
  //         method: 'POST',
  //         body: { products: [{ productId: product._id, qty: 25 }], userId: user._id },
  //       })
  //     )
  //     .then((resp) => {
  //       expect(resp.status).toBe(200);
  //       return resp.json();
  //     })
  //     .then((json) => {
  //       expect(typeof json._id).toBe('string');
  //       expect(typeof json.dateEntry).toBe('string');
  //       expect(Array.isArray(json.products)).toBe(true);
  //       expect(json.products.length).toBe(1);
  //       expect(json.products[0].product.name).toBe('Test');
  //       expect(json.products[0].product.price).toBe(25);
  //       done();
  //     });
  // });
});

describe('GET /orders', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/orders').then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should get orders as user', (done) => {
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: {
          name: 'Test 11',
          price: 10,
          image: 'url_image',
          category: 'Breakfast',
          type: 'Side dishes',
        },
      }),
      fetchAsTestUser('/users/test@test.co'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(201);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) =>
        // Promise.all([
        fetchAsTestUser('/orders', {
          method: 'POST',
          body: {
            userId: user._id,
            client: 'client',
            products: [{ product: product._id, qty: 5 }],
            status: 'pending',
          },
        })
          // fetchAsAdmin('/orders', {
          //   method: 'POST',
          //   body: { products: [{ productId: product._id, qty: 25 }], userId: user._id },
          // }),
          // ])
          .then((response) => {
            expect(response.status).toBe(201);
            // expect(responses[1].status).toBe(200);
            return fetchAsTestUser('/orders');
          })
          .then((resp) => {
            expect(resp.status).toBe(200);
            return resp.json();
          })
      )
      .then((orders) => {
        expect(Array.isArray(orders)).toBe(true);
        expect(orders.length > 0);
        const userIds = orders.reduce((memo, order) => (memo.indexOf(order.userId) === -1 ? [...memo, order.userId] : memo), []);
        expect(userIds.length >= 1).toBe(true);
        done();
      });
  });

  it('should get orders as admin', (done) => {
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: {
          name: 'Test 12',
          price: 10,
          image: 'url_image',
          category: 'Breakfast',
          type: 'Side dishes',
        },
      }),
      fetchAsTestUser('/users/test@test.co'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(201);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) =>
        // Promise.all([
        fetchAsTestUser('/orders', {
          method: 'POST',
          body: {
            userId: user._id,
            client: 'client',
            products: [{ product: product._id, qty: 5 }],
            status: 'pending',
          },
        })
          // fetchAsAdmin('/orders', {
          //   method: 'POST',
          //   body: { products: [{ productId: product._id, qty: 25 }], userId: user._id },
          // }),
          // ])
          .then((response) => {
            expect(response.status).toBe(201);
            // expect(responses[1].status).toBe(200);
            return fetchAsAdmin('/orders');
          })
          .then((resp) => {
            expect(resp.status).toBe(200);
            return resp.json();
          })
      )
      .then((orders) => {
        expect(Array.isArray(orders)).toBe(true);
        expect(orders.length > 0);
        const userIds = orders.reduce((memo, order) => (memo.indexOf(order.userId) === -1 ? [...memo, order.userId] : memo), []);
        expect(userIds.length >= 1).toBe(true);
        done();
      });
  });
});

describe('GET /orders/:orderId', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/orders/61129b864ebe2a1bb4c35081').then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 404 when admin and not found', (done) => {
    fetchAsAdmin('/orders/61129b864ebe2a1bb4c35081').then((resp) => {
      expect(resp.status).toBe(404);
      done();
    });
  });

  it('should get order as user', (done) => {
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: {
          name: 'Test 14',
          price: 10,
          image: 'url_image',
          category: 'Breakfast',
          type: 'Side dishes',
        },
      }),
      fetchAsTestUser('/users/test@test.co'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(201);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) =>
        fetchAsTestUser('/orders', {
          method: 'POST',
          body: {
            userId: user._id,
            client: 'client',
            products: [{ product: product._id, qty: 5 }],
            status: 'pending',
          },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => fetchAsTestUser(`/orders/${json._id}`))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('Test 14');
        expect(json.products[0].product.price).toBe(10);
        done();
      });
  });

  it('should get order as admin', (done) => {
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: {
          name: 'Test 15',
          price: 10,
          image: 'url_image',
          category: 'Breakfast',
          type: 'Side dishes',
        },
      }),
      fetchAsTestUser('/users/test@test.co'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(201);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) =>
        fetchAsTestUser('/orders', {
          method: 'POST',
          body: {
            userId: user._id,
            client: 'client',
            products: [{ product: product._id, qty: 5 }],
            status: 'pending',
          },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => fetchAsAdmin(`/orders/${json._id}`))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('Test 15');
        expect(json.products[0].product.price).toBe(10);
        done();
      });
  });
});

describe('PUT /orders/:orderId', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/orders/61129b864ebe2a1bb4c35081', { method: 'PUT' }).then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 404 when not found', (done) => {
    fetchAsTestUser('/orders/61129b864ebe2a1bb4c35081', {
      method: 'PUT',
      body: { state: 'canceled' },
    }).then((resp) => {
      expect(resp.status).toBe(404);
      done();
    });
  });

  it('should fail with 400 when bad props', (done) => {
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: {
          name: 'Test 16',
          price: 10,
          image: 'url_image',
          category: 'Breakfast',
          type: 'Side dishes',
        },
      }),
      fetchAsTestUser('/users/test@test.co'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(201);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) =>
        fetchAsTestUser('/orders', {
          method: 'POST',
          body: {
            userId: user._id,
            client: 'client',
            products: [{ product: product._id, qty: 5 }],
            status: 'pending',
          },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      // .then((json) => fetchAsTestUser(`/orders/${json._id}`))
      // .then((resp) => resp.json())
      .then((json) => fetchAsTestUser(`/orders/${json._id}`, { method: 'PUT' }))
      .then((resp) => {
        expect(resp.status).toBe(400);
        done();
      });
  });

  it('should fail with 400 when bad status', (done) => {
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: {
          name: 'Test 17',
          price: 10,
          image: 'url_image',
          category: 'Breakfast',
          type: 'Side dishes',
        },
      }),
      fetchAsTestUser('/users/test@test.co'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(201);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) =>
        fetchAsTestUser('/orders', {
          method: 'POST',
          body: {
            userId: user._id,
            client: 'client',
            products: [{ product: product._id, qty: 5 }],
            status: 'pending',
          },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) =>
        fetchAsTestUser(`/orders/${json._id}`, {
          method: 'PUT',
          body: { status: 'oh yeah!' },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(400);
        done();
      });
  });

  it('should update order (set status to preparing)', (done) => {
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: {
          name: 'Test 18',
          price: 10,
          image: 'url_image',
          category: 'Breakfast',
          type: 'Side dishes',
        },
      }),
      fetchAsTestUser('/users/test@test.co'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(201);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) =>
        fetchAsTestUser('/orders', {
          method: 'POST',
          body: {
            userId: user._id,
            client: 'client',
            products: [{ product: product._id, qty: 5 }],
            status: 'pending',
          },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('pending');
        return fetchAsTestUser(`/orders/${json._id}`, {
          method: 'PUT',
          body: { status: 'preparing' },
        });
      })
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('preparing');
        done();
      });
  });

  // it.skip('should update order (set status to delivering)', (done) => {
  //   Promise.all([
  //     fetchAsAdmin('/products', {
  //       method: 'POST',
  //       body: { name: 'Test', price: 66 },
  //     }),
  //     fetchAsTestUser('/users/test@test.test'),
  //   ])
  //     .then((responses) => {
  //       expect(responses[0].status).toBe(200);
  //       expect(responses[1].status).toBe(200);
  //       return Promise.all([responses[0].json(), responses[1].json()]);
  //     })
  //     .then(([product, user]) =>
  //       fetchAsTestUser('/orders', {
  //         method: 'POST',
  //         body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
  //       })
  //     )
  //     .then((resp) => {
  //       expect(resp.status).toBe(200);
  //       return resp.json();
  //     })
  //     .then((json) => {
  //       expect(json.status).toBe('pending');
  //       return fetchAsAdmin(`/orders/${json._id}`, {
  //         method: 'PUT',
  //         body: { status: 'delivering' },
  //       });
  //     })
  //     .then((resp) => {
  //       expect(resp.status).toBe(200);
  //       return resp.json();
  //     })
  //     .then((json) => {
  //       expect(json.status).toBe('delivering');
  //       done();
  //     });
  // });

  // it.skip('should update order (set status to delivered)', (done) => {
  //   Promise.all([
  //     fetchAsAdmin('/products', {
  //       method: 'POST',
  //       body: { name: 'Test', price: 66 },
  //     }),
  //     fetchAsTestUser('/users/test@test.test'),
  //   ])
  //     .then((responses) => {
  //       expect(responses[0].status).toBe(200);
  //       expect(responses[1].status).toBe(200);
  //       return Promise.all([responses[0].json(), responses[1].json()]);
  //     })
  //     .then(([product, user]) =>
  //       fetchAsTestUser('/orders', {
  //         method: 'POST',
  //         body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
  //       })
  //     )
  //     .then((resp) => {
  //       expect(resp.status).toBe(200);
  //       return resp.json();
  //     })
  //     .then((json) => {
  //       expect(json.status).toBe('pending');
  //       return fetchAsAdmin(`/orders/${json._id}`, {
  //         method: 'PUT',
  //         body: { status: 'delivered' },
  //       });
  //     })
  //     .then((resp) => {
  //       expect(resp.status).toBe(200);
  //       return resp.json();
  //     })
  //     .then((json) => {
  //       expect(json.status).toBe('delivered');
  //       expect(typeof json.dateProcessed).toBe('string');
  //       done();
  //     });
  // });
});

describe('DELETE /orders/:orderId', () => {
  it('should fail with 401 when no auth', (done) => {
    fetch('/orders/61129b864ebe2a1bb4c35081', { method: 'DELETE' }).then((resp) => {
      expect(resp.status).toBe(401);
      done();
    });
  });

  it('should fail with 404 when not found', (done) => {
    fetchAsTestUser('/orders/61129b864ebe2a1bb4c35081', { method: 'DELETE' }).then((resp) => {
      expect(resp.status).toBe(404);
      done();
    });
  });

  it('should delete other order as admin', (done) => {
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: {
          name: 'Test 19',
          price: 10,
          image: 'url_image',
          category: 'Breakfast',
          type: 'Side dishes',
        },
      }),
      fetchAsTestUser('/users/test@test.co'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(201);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) =>
        fetchAsTestUser('/orders', {
          method: 'POST',
          body: {
            userId: user._id,
            client: 'client',
            products: [{ product: product._id, qty: 5 }],
            status: 'pending',
          },
        })
      )
      .then((resp) => {
        expect(resp.status).toBe(201);
        return resp.json();
      })
      .then(({ _id }) => fetchAsTestUser(`/orders/${_id}`, { method: 'DELETE' }).then((resp) => ({ resp, _id })))
      .then(({ resp, _id }) => {
        expect(resp.status).toBe(204);
        return fetchAsAdmin(`/orders/${_id}`);
      })
      .then((resp) => {
        expect(resp.status).toBe(404);
        done();
      });
  });
});
