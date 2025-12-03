import { model, Schema } from 'mongoose';

export interface IProduct {
  title: string;
  image: { fileName: string; originalName: string };
  category: string;
  description: string;
  price: number;
}

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    minlength: [2, 'Минимальная длина поля title - 2'],
    maxlength: [30, 'Максимальная длина поля title - 30'],
    unique: true,
    required: [true, 'Поле title должно быть заполнено'],
  },
  image: {
    type: {
      fileName: {
        type: String,
        required: [true, 'Поле image.fileName должно быть заполнено'],
      },
      originalName: {
        type: String,
        required: [true, 'Поле image.originalName должно быть заполнено'],
      },
    },
    required: [true, 'Поле image должно быть заполнено'],
  },
  category: {
    type: String,
    required: [true, 'Поле category должно быть заполнено'],
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  price: {
    type: Number,
    required: false,
    default: null,
    min: [0, 'Поле price должно быть положительным'],
  },
});

// TS-интерфейс модели product

export default model<IProduct>('product', productSchema);
