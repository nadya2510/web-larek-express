import {
  Request,
  Response,
  NextFunction,
} from 'express';
import { Error as MongooseError } from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import {
  UPLOAD_PUBLIC,
  UPLOAD_PATH_TEMP,
} from '../configs';

// Поднимаемся на уровень выше от controllers → к корневому каталогу
const rootDir = path.join(__dirname, '..');
// Полные пути к папкам
const tempDir = path.resolve(rootDir, UPLOAD_PATH_TEMP);
const uploadDir = path.resolve(rootDir, UPLOAD_PUBLIC);

export const getProduct = (_req: Request, res: Response, next: NextFunction) : void => {
  Product.find({})
    .then((products) => res.send({ items: products, total: products.length }))
    .catch(() => next(new MongooseError('Произошла ошибка')));
};
export const postProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { fileName } = req.body.image;
  const tempFilePath = path.join(tempDir, fileName);
  const uploadFilePath = path.join(uploadDir, fileName);
  try {
    await fs.access(tempFilePath);
    await fs.rename(tempFilePath, uploadFilePath);
  } catch {
    console.error('Файл не найден');
  }
  return Product.create({ ...req.body })
    .then((product) => res.status(201).send({ item: product }))
    .catch((error: Error) => {
      if (error.message.includes('E11000')) {
        next(new ConflictError('Товар с таким названием уже существует'));
      } else if (error.name === 'ValidationError') {
        next(new BadRequestError('Ошибка валидации данных'));
      }
      next(new MongooseError('Произошла ошибка'));
    });
};

export const patchProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  let fileName;

  if (req.body.image) {
    [, , fileName] = req.body.image.fileName.split('/', 3);
  }

  if (fileName) {
    const tempFilePath = path.join(tempDir, fileName);
    const uploadFilePath = path.join(uploadDir, fileName);

    try {
      await fs.access(tempFilePath);
      await fs.rename(tempFilePath, uploadFilePath);
    } catch {
      return next(new NotFoundError('Файл не найден'));
    }
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(new NotFoundError('Продукт не найден'));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body },
      {
        new: true,
        runValidators: true,
      },
    );
    return res.status(200).send({
      item: updatedProduct,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('E11000')) {
        return next(new ConflictError('Товар с таким названием уже существует'));
      }
      if (error.name === 'ValidationError') {
        return next(new BadRequestError('Ошибка валидации данных'));
      }
    }
    return next(new MongooseError('Произошла ошибка'));
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  let product;
  try {
    product = await Product.findOne({ _id: id });
    if (!product) {
      return next(new NotFoundError('Продукт не найден'));
    }

    await Product.deleteOne({ _id: id });
    return res.status(200).send({
      success: id,
    });
  } catch (error) {
    return next(new MongooseError(`Произошла ошибка при удалении продукта:${error}`));
  }
};
