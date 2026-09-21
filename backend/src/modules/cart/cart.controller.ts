import { Request, Response, NextFunction } from 'express';
import {
  getCartService,
  addCartItemService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
} from './cart.service.js';

export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cart = await getCartService(req.user!.id);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function addCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId } = req.body;
    const cart = await addCartItemService(req.user!.id, productId);
    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(
  req: Request<{ productId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { qty } = req.body;
    const cart = await updateCartItemService(
      req.user!.id,
      parseInt(req.params.productId),
      qty,
    );

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(
  req: Request<{ productId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cart = await removeCartItemService(
      req.user!.id,
      parseInt(req.params.productId),
    );

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cart = await clearCartService(req.user!.id);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}
