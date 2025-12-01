import { ErrorRequestHandler } from 'express';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера';

  // Определяем тип ошибки и задаём соответствующие статус и сообщение
  if (error.message?.includes('validation failed')) {
    // Ошибки валидации Mongoose
    statusCode = 400;
    message = 'Ошибка валидации данных';
  } else if (error instanceof BadRequestError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = error.statusCode;
    message = error.message || 'Конфликт: ресурс уже существует';
  } else if (error instanceof NotFoundError) {
    statusCode = error.statusCode;
    message = error.message || 'Ресурс не найден';
  } else if (error.message?.includes('E11000')) {
    // Дубликат уникального поля (например, title)
    statusCode = 409;
    message = 'Товар с таким названием уже существует';
  } else if (error.name === 'UnauthorizedError') {
    // Ошибки авторизации
    statusCode = 401;
    message = 'Авторизация не выполнена';
  }

  // Логируем ошибку (в проде можно отправить в систему мониторинга)
  // eslint-disable-next-line no-console
  console.error(
    `[${req.method}] ${req.path} | ${statusCode} | ${error.message}`,
  );

  // Отправляем единообразный ответ
  res.status(statusCode).json({ message });
};

export default errorHandler;
