import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import { Error as MongooseError } from 'mongoose';
import {
  AUTH_REFRESH_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '../configs';
import User from '../models/user';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import UnauthorizedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';

export const login = (req: Request, res: Response, next: NextFunction) => {
  const maxAge = ms(AUTH_REFRESH_TOKEN_EXPIRY as StringValue);
  const path = '/';
  return User.findUserByCredentials(req.body.email, req.body.password)
    .then(async (user) => {
      const { name, email } = user;

      const accessToken = jwt.sign({ _id: user._id }, ACCESS_TOKEN_SECRET, {
        expiresIn: '10m',
      });
      const refreshToken = jwt.sign({ _id: user._id }, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
      });
      user.tokens.push({ token: refreshToken });
      await user.save();

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge,
        path,
      });
      return res.send({
        user: {
          email,
          name,
        },
        success: true,
        accessToken,
      });
    })
    .catch((error) => {
      if (error instanceof Error) {
        if (error.name === 'UnauthorizedError') {
          next(new UnauthorizedError('Авторизация не выполнена'));
        }
      }
      next(new BadRequestError('Ошибка валидации данных'));
    });
};
// Регистрация пользователя
export const register = (req: Request, res: Response, next: NextFunction) => {
  const maxAge = ms(AUTH_REFRESH_TOKEN_EXPIRY as StringValue);
  const path = '/';
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const nameReq = req.body.name;
      const emailReq = req.body.email;
      return User.create({
        name: nameReq,
        email: emailReq,
        password: hash,
      });
    })
    .then(async (user) => {
      const { name, email } = user;

      const accessToken = jwt.sign({ _id: user._id }, ACCESS_TOKEN_SECRET, {
        expiresIn: '10m',
      });
      const refreshToken = jwt.sign({ _id: user._id }, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
      });

      user.tokens.push({ token: refreshToken });
      await user.save();

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge,
        path,
      });

      res.status(201).send({
        user: {
          email,
          name,
        },
        success: true,
        accessToken,
      });
    })
    .catch((error) => {
      if (error instanceof Error) {
        if (error.message.includes('E11000')) {
          next(new ConflictError('Email уже зарегистрирован в системе'));
        } else if (error.name === 'ValidationError') {
          next(new BadRequestError('Ошибка валидации данных'));
        }
      }
      next(new MongooseError('Произошла ошибка'));
    });
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new BadRequestError('Произошла ошибка'));
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      _id: string;
    };

    const user = await User.findById(decoded._id).select('+tokens');

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    const tokenExists = user.tokens.some((t) => t.token === refreshToken);
    if (!tokenExists) {
      return next(new UnauthorizedError('Авторизация не выполнена'));
    }

    // Генерируем новые токены с другими именами переменных
    const newAccessToken = jwt.sign({ _id: user._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: '10m',
    });
    const newRefreshToken = jwt.sign({ _id: user._id }, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    // Фильтруем старые токены и добавляем новый
    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    user.tokens.push({ token: newRefreshToken });

    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as StringValue),
      path: '/',
    });

    return res.json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Токен устарел'));
      }
      if (error.name === 'JsonWebTokenError') {
        return next(new UnauthorizedError('Некорректный токен'));
      }
      if (error.name === 'ValidationError') {
        return next(new BadRequestError('Ошибка валидации данных'));
      }
    }
    // Общий обработчик для всех остальных случаев
    return next(new MongooseError('Произошла ошибка'));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new BadRequestError('Произошла ошибка'));
  }
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      _id: string;
    };
    const user = await User.findById(decoded._id).select('+tokens');

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    user.tokens = user.tokens.filter((t) => t.token === '');
    await user.save();

    res.clearCookie('refreshToken');
    return res.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Авторизация не выполнена'));
    }
    return next(new BadRequestError('Произошла ошибка'));
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Авторизация не выполнена'));
  }
  const token = authorization.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { _id: string };
    const user = await User.findById(decoded._id).select('name email');
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    return res.json({
      user: { email: user.email, name: user.name },
      success: true,
    });
  } catch (error) {
    return next(new UnauthorizedError(`Недействительный токен ${token}`));
  }
};
