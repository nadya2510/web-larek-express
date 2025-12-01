import {
  Request,
  Response,
  NextFunction,
} from 'express';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new BadRequestError('Файл не загружен'));
  }

  const { filename, originalname } = req.file;

  return res.json({
    fileName: `/images/${filename}`,
    originalName: originalname,
  });
};

export default uploadFile;
