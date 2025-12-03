import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import postOrder from '../controllers/order';
import { orderSchema } from '../middlewares/validatons';

const orderValidator = celebrate({
  [Segments.BODY]: orderSchema,
});

const routerOrder = Router();
routerOrder.post('/', orderValidator, postOrder);

export default routerOrder;
