import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError.js';

type RequestPart = 'body' | 'query' | 'params';

// Parsed `body` and `query` replace the raw values, so handlers receive
// the schema's output (defaults and coercions applied). `params` is only
// checked: Express types them as strings, and handlers convert them.
export function validate(schema: ZodTypeAny, part: RequestPart = 'body'): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      next(ApiError.badRequest(result.error.errors[0]?.message ?? 'Validation failed'));
      return;
    }

    if (part !== 'params') {
      req[part] = result.data;
    }

    next();
  };
}
