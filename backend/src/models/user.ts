import {
  model,
  Model,
  Schema,
  Document,
} from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import UnauthorizedError from '../errors/unauthorized-error';

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

export type UserDocument = Document & IUser;

interface UserModel extends Model<IUser> {
  findUserByCredentials: (
    email: string,
    password: string,
  ) => Promise<UserDocument>;
}

const userSchema = new Schema<IUser, UserModel>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Ё-мое',
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email обязателен'],
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: 6,
    select: false,
  },
  tokens: {
    type: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    default: [],
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email: string,
  password: string,
): Promise<UserDocument> {
  return this.findOne({ email })
    .select('+password')
    .select('+tokens')
    .exec()
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new UnauthorizedError('Авторизация не выполнена'),
        );
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            new UnauthorizedError('Авторизация не выполнена'),
          );
        }

        return user;
      });
    });
};

export default model<IUser, UserModel>('User', userSchema);
