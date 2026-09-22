import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { productsRouter } from './modules/products/products.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { cartRouter } from './modules/cart/cart.routes.js';
import { favoritesRouter } from './modules/favorites/favorites.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  const corsOrigins = config.CORS_ORIGIN.split(',').map(origin =>
    origin.trim(),
  );

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Routes
  app.use(authRouter);
  app.use(productsRouter);
  app.use(cartRouter);
  app.use(favoritesRouter);
  app.use(ordersRouter);
  // - reviews routes (Phase 5)

  app.use(errorHandler);

  return app;
}
