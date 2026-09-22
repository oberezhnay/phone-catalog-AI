import { Request, Response, NextFunction } from 'express';
import {
  createOrderService,
  getOrdersService,
  getOrderService,
} from './orders.service.js';

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const order = await createOrderService(req.user!.id);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orders = await getOrdersService(req.user!.id);

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrder(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const order = await getOrderService(req.user!.id, parseInt(req.params.id));

    res.json(order);
  } catch (error) {
    next(error);
  }
}
