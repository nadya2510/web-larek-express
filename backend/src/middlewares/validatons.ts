import Joi from 'joi';

export const productSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.base': 'Заголовок должен быть строкой',
      'string.empty': 'Заголовок не может быть пустым',
      'any.required': 'Заголовок обязателен',
      'string.min': 'Заголовок должен содержать минимум 2 символа',
      'string.max': 'Заголовок не должен превышать 30 символов',
    }),
  image: Joi.object({
    fileName: Joi.string()
      .required()
      .messages({
        'string.base': 'Имя файла должно быть строкой',
        'any.required': 'Имя файла обязательно для заполнения',
      }),
    originalName: Joi.string()
      .required()
      .messages({
        'string.base': 'Оригинальное имя файла должно быть строкой',
        'any.required': 'Оригинальное имя файла обязательно для заполнения',
      }),
  })
    .required()
    .messages({
      'any.required': 'Информация об изображении обязательна для заполнения',
    }),
  category: Joi.string()
    .required()
    .messages({
      'string.base': 'Категория должна быть строкой',
      'any.required': 'Категория обязательна для заполнения',
    }),
  description: Joi.string()
    .optional(),
  price: Joi.number()
    .allow(null)
    .optional()
    .default(null)
    .messages({
      'number.base': 'Цена должна быть числом',
      'any.allowOnly': 'Цена должна быть положительным числом или null',
    }),
});

export const productUpdateSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.base': 'Заголовок должен быть строкой',
      'string.empty': 'Заголовок не может быть пустым',
      'any.required': 'Заголовок обязателен',
      'string.min': 'Заголовок должен содержать минимум 2 символа',
      'string.max': 'Заголовок не должен превышать 30 символов',
    }),
  image: Joi.object({
    fileName: Joi.string()
      .required()
      .messages({
        'string.base': 'Имя файла должно быть строкой',
        'any.required': 'Имя файла обязательно для заполнения',
      }),
    originalName: Joi.string()
      .required()
      .messages({
        'string.base': 'Оригинальное имя файла должно быть строкой',
        'any.required': 'Оригинальное имя файла обязательно для заполнения',
      }),
  }),
  category: Joi.string()
    .required()
    .messages({
      'string.base': 'Категория должна быть строкой',
      'any.required': 'Категория обязательна для заполнения',
    }),
  description: Joi.string()
    .optional(),
  price: Joi.number()
    .allow(null)
    .optional()
    .default(null)
    .messages({
      'any.allowOnly': 'Цена должна быть положительным числом или null',
    }),
});

export const orderSchema = Joi.object({
  payment: Joi.string()
    .valid('card', 'online')
    .required()
    .messages({
      'any.only': 'Способ оплаты может быть только "card" или "online"',
      'any.required': 'Способ оплаты обязателен для заполнения',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email должен быть строкой',
      'string.email': 'Email должен быть корректным адресом электронной почты',
      'any.required': 'Email обязателен для заполнения',
    }),
  phone: Joi.string()
    .required()
    .messages({
      'string.base': 'Телефон должен быть строкой',
      'any.required': 'Телефон обязателен для заполнения',
    }),
  address: Joi.string()
    .required()
    .messages({
      'string.base': 'Адрес должен быть строкой',
      'any.required': 'Адрес обязателен для заполнения',
    }),
  total: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Общая сумма должна быть числом',
      'number.empty': 'Общая сумма не может быть пустой',
      'number.negative': 'Общая сумма должна быть положительной',
      'number.zero': 'Общая сумма должна быть больше нуля',
      'any.required': 'Общая сумма обязательна для заполнения',
    }),
  items: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .required()
    .messages({
      'array.base': 'Список товаров должен быть массивом',
      'any.required': 'Список товаров обязателен для заполнения',
    }),
});

export const productIdSchema = {
  id: Joi.string()
    .hex()
    .required()
    .messages({ 'string.guid': 'Необходимо передавать hex строку' }),
};

export const userSchema = Joi.object({
  name: Joi.string()
    .optional(),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email должен быть корректным адресом электронной почты',
      'any.required': 'Email обязателен для заполнения',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Пароль должен содержать не менее 6 символов',
      'any.required': 'Пароль обязателен для заполнения',
      'string.trim': 'Пароль не должен содержать пробелов в начале и конце',
    }),
});
