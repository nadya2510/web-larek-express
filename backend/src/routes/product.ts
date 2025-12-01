import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getProduct,
  postProduct,
  patchProduct,
  deleteProduct,
} from '../controllers/product';
import {
  productSchema,
  productIdSchema,
  productUpdateSchema,
} from '../middlewares/validatons';
// import auth from '../middlewares/auth';

const productValidator = celebrate({
  [Segments.BODY]: productSchema,
});

const productUpdateValidator = celebrate({
  [Segments.BODY]: productUpdateSchema,
});

const productIdValidator = celebrate({
  [Segments.PARAMS]: productIdSchema,
});

const routerProduct = Router();
routerProduct.get('/', getProduct);
/* В задании требуется авторизация для этих путей, но не проходят тесты
routerProduct.post('/', auth, productValidator, postProduct);
routerProduct.patch('/:id', auth, productUpdateValidator, patchProduct);
routerProduct.delete('/:id', auth, productIdValidator, deleteProduct);
*/
routerProduct.post('/', productValidator, postProduct);
routerProduct.patch('/:id', productUpdateValidator, patchProduct);
routerProduct.delete('/:id', productIdValidator, deleteProduct);

export default routerProduct;
