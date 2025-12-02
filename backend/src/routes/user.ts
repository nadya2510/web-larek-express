import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  refreshAccessToken,
  logout,
  login,
  register,
  getCurrentUser,
} from '../controllers/auth';
import { userSchema } from '../middlewares/validatons';
// import auth from '../middlewares/auth';

const userValidator = celebrate({
  [Segments.BODY]: userSchema,
});

const routerUser = Router();
routerUser.post('/login', userValidator, login);
routerUser.post('/register', userValidator, register);
routerUser.get('/token', refreshAccessToken);
// routerUser.get('/logout', auth, logout);
routerUser.get('/logout', logout);
// routerUser.get('/user', auth, getCurrentUser);
routerUser.get('/user', getCurrentUser);

export default routerUser;
