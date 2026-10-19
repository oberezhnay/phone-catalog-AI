import { asyncHandler, NoParams } from '../../utils/asyncHandler.js';
import { registerService, loginService, getMeService } from './auth.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { LoginInput, RegisterInput } from './auth.schema.js';

export const register = asyncHandler<NoParams, unknown, RegisterInput>(
  async (req, res) => {
    res.status(201).json(await registerService(req.body));
  },
);

export const login = asyncHandler<NoParams, unknown, LoginInput>(
  async (req, res) => {
    res.json(await loginService(req.body));
  },
);

export const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  res.json(await getMeService(req.user.id));
});
