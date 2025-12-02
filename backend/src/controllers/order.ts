import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const postOrder = async (req: Request, res: Response, next: NextFunction) => {
  const orderData = req.body;
  const allProducts = Product.find({ _id: { $in: orderData.items } });
  const filteredProducts = await allProducts;

  try {
    /* необходимо проверить, что переданный _id существует в базе */
    if (filteredProducts.length !== orderData.items.length) {
      return next(
        new BadRequestError(
          'Один или несколько товаров не найдены в базе данных',
        ),
      );
    }

    /* проверить, что товар продается, т. е. поле price не равно null */
    const hasInvalidPrice = filteredProducts.some(
      (product) => product.price === null,
    );
    if (hasInvalidPrice) {
      const invalidProduct = filteredProducts.find(
        (product) => product.price === null,
      );
      if (invalidProduct) {
        return next(
          new BadRequestError(
            `Товар '${invalidProduct.title}' (ID: ${invalidProduct._id}) недоступен для покупки`,
          ),
        );
      }
    }

    /* проверить, что стоимость переданных товаров в сумме равна total */
    const calculatedTotal = filteredProducts.reduce(
      (sum, p) => sum + (p.price ?? 0),
      0,
    );

    if (calculatedTotal !== orderData.total) {
      return next(
        new BadRequestError(
          `Некорректная сумма заказа: ожидаемая сумма ${calculatedTotal}, получено ${orderData.total}`,
        ),
      );
    }

    /* Возвращаемый ID заказа можно сгенерировать библиотекой @faker-js/faker */
    return res.status(200).json({
      id: faker.string.uuid(),
      total: orderData.total,
    });
  } catch (err) {
    return next(new BadRequestError('Ошибка при оформлении заказа'));
  }
};

export default postOrder;
