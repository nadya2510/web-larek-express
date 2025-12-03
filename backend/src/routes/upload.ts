import express from 'express';
import fileMiddleware from '../middlewares/file';
import uploadFile from '../controllers/upload';
// import auth from '../middlewares/auth';

const routerUpload = express.Router();

// routerUpload.post('/', auth, fileMiddleware.single('file'), uploadFile);
routerUpload.post('/', fileMiddleware.single('file'), uploadFile);

export default routerUpload;
