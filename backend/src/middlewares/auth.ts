import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../configs';
import UnauthorizedError from '../errors/unauthorized-error';

interface SessionRequest extends Request {
  user?: string | JwtPayload;
}

export default (req: SessionRequest, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Авторизация не выполнена'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as { _id: string };
    req.user = payload;
  } catch (err) {
    return next(new UnauthorizedError('Авторизация не выполнена'));
  }
  return next();
};
