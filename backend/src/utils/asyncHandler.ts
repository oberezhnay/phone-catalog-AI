import { NextFunction, Request, Response, RequestHandler } from 'express';

// Express 4 does not catch promise rejections from handlers, so every
// async controller would need its own try/catch. This forwards them to next().
// Route without path params (the type for P when a path has no :param).
export type NoParams = Record<string, never>;

export function asyncHandler<
  P = NoParams,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Request['query'],
>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => Promise<void>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
