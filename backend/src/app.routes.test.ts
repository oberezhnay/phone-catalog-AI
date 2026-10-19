import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { prismaMock } from './test/prismaMock.js';
import { createApp } from './app.js';
import { signToken } from './utils/jwt.js';

const app = createApp();

const userToken = signToken({ id: 1, email: 'u@test.com', role: 'user' });
const adminToken = signToken({ id: 2, email: 'a@test.com', role: 'admin' });
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('app', () => {
  it('answers the health check', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns a JSON 404 for unknown /api routes', async () => {
    const res = await request(app).get('/api/nope');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid JSON body');
  });
});

describe('auth routes', () => {
  it('rejects registration with an invalid body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '123', name: '' });

    expect(res.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('returns 409 when the email is already registered', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 } as never);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'u@test.com', password: 'secret1', name: 'U' });

    expect(res.status).toBe(409);
  });

  it('returns 401 for an unknown user on login', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'u@test.com', password: 'secret1' });

    expect(res.status).toBe(401);
  });

  it('requires a token on /me', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('rejects a garbage token on /me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set(bearer('not.a.token'));

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid token');
  });

  it('returns the public user for a valid token', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'u@test.com',
      name: 'U',
      role: 'user',
      passwordHash: 'secret-hash',
    } as never);

    const res = await request(app).get('/api/auth/me').set(bearer(userToken));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      email: 'u@test.com',
      name: 'U',
      role: 'user',
    });
  });
});

describe('products routes', () => {
  it('ignores an unknown sort value instead of failing', async () => {
    prismaMock.product.count.mockResolvedValue(0);
    prismaMock.product.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/products?sort=bogus&page=-3');

    expect(res.status).toBe(200);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: undefined, skip: 0 }),
    );
  });

  it('returns items and total for a valid query', async () => {
    prismaMock.product.count.mockResolvedValue(1);
    prismaMock.product.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/products?perPage=4&page=1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body.total).toBe(1);
  });

  it('returns 404 for an unknown product', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    prismaMock.product.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/products/phones/missing-item');

    expect(res.status).toBe(404);
  });

  it('requires authentication to create a product', async () => {
    const res = await request(app).post('/api/products').send({});

    expect(res.status).toBe(401);
  });

  it('forbids a non-admin from creating a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set(bearer(userToken))
      .send({});

    expect(res.status).toBe(403);
  });

  it('validates the body for an admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set(bearer(adminToken))
      .send({});

    expect(res.status).toBe(400);
  });

  it('rejects a non-numeric id on delete', async () => {
    const res = await request(app)
      .delete('/api/products/abc')
      .set(bearer(adminToken));

    expect(res.status).toBe(400);
    expect(prismaMock.product.delete).not.toHaveBeenCalled();
  });
});

describe('cart and favorites routes', () => {
  it.each([
    ['get', '/api/cart'],
    ['delete', '/api/cart'],
    ['get', '/api/favorites'],
    ['get', '/api/orders'],
  ] as const)('%s %s requires a token', async (method, url) => {
    const res = await request(app)[method](url);

    expect(res.status).toBe(401);
  });

  it('returns an empty cart for a user without one', async () => {
    prismaMock.cart.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/cart').set(bearer(userToken));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('rejects an invalid productId param', async () => {
    const res = await request(app)
      .delete('/api/cart/abc')
      .set(bearer(userToken));

    expect(res.status).toBe(400);
  });
});

describe('admin orders routes', () => {
  it('requires a token', async () => {
    const res = await request(app).get('/api/admin/orders');

    expect(res.status).toBe(401);
  });

  it('forbids a non-admin', async () => {
    const list = await request(app)
      .get('/api/admin/orders')
      .set(bearer(userToken));
    const patch = await request(app)
      .patch('/api/admin/orders/1/status')
      .set(bearer(userToken))
      .send({ status: 'paid' });

    expect(list.status).toBe(403);
    expect(patch.status).toBe(403);
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  it('lists orders for an admin and rejects an unknown status filter', async () => {
    prismaMock.order.findMany.mockResolvedValue([]);

    const ok = await request(app)
      .get('/api/admin/orders?status=shipped')
      .set(bearer(adminToken));
    const bad = await request(app)
      .get('/api/admin/orders?status=bogus')
      .set(bearer(adminToken));

    expect(ok.status).toBe(200);
    expect(bad.status).toBe(400);
  });

  it('validates the status body and the id', async () => {
    const badStatus = await request(app)
      .patch('/api/admin/orders/1/status')
      .set(bearer(adminToken))
      .send({ status: 'bogus' });
    const badId = await request(app)
      .patch('/api/admin/orders/abc/status')
      .set(bearer(adminToken))
      .send({ status: 'paid' });

    expect(badStatus.status).toBe(400);
    expect(badId.status).toBe(400);
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  it('updates the status for an admin', async () => {
    prismaMock.order.update.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'paid',
      total: 100,
      createdAt: new Date(),
      items: [],
      user: { id: 3, email: 'u@test.com', name: 'U' },
    } as never);

    const res = await request(app)
      .patch('/api/admin/orders/1/status')
      .set(bearer(adminToken))
      .send({ status: 'paid' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('paid');
  });

  it('returns 404 when the order does not exist', async () => {
    prismaMock.order.update.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .patch('/api/admin/orders/999/status')
      .set(bearer(adminToken))
      .send({ status: 'paid' });

    expect(res.status).toBe(404);
  });
});
