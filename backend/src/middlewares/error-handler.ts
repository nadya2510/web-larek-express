import { ErrorRequestHandler } from 'express';
import { isCelebrateError } from 'celebrate';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';

const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера';

  const errorTypes = [BadRequestError, ConflictError, NotFoundError, UnauthorizedError];

  if (errorTypes.some((type) => error instanceof type)) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (isCelebrateError(error)) {
    statusCode = 400;
    message = 'Ошибка валидации';
    [...error.details.keys()].forEach((key) => {
      const errorKey = error.details.get(key);
      if (errorKey && errorKey.details && errorKey.details.length > 0) {
        message = errorKey.details[0].message;
      }
    });
  }

  console.error(`[${req.method}] ${req.path} | ${statusCode} | ${error.message}`);

  // Отправляем единообразный ответ
  res.status(statusCode).json({ message });
};

export default errorHandler;
