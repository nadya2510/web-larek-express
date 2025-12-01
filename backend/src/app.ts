import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import { PORT, DB_ADDRESS, ORIGIN_ALLOW } from './configs';
import {
  routerOrder,
  routerProduct,
  routerUser,
  routerUpload,
} from './routes/index';
import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';

const corsOptions = {
  origin: ORIGIN_ALLOW,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true,
};
const app = express();
app.use(cookieParser());
/* доступ только к публичным файлам (картинам) */
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));

/* для JSON-формата */
app.use(express.json());
/* Логирование */
app.use(requestLogger);
/* Роутеры */
app.use('/auth', routerUser);
app.use('/upload', routerUpload);
app.use('/product', routerProduct);
app.use('/order', routerOrder);

/* подключимся к БД */
mongoose.connect(DB_ADDRESS);

/* Логирование ошибок */
app.use(errorLogger);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
