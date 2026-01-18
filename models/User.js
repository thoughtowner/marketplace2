import { EntitySchema } from 'typeorm';

export const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: Number, primary: true, generated: true },
    login: { type: String, unique: true, length: 255 },
    hashPassword: { name: 'hash_password', type: String, length: 255 },
  },
  relations: {
    consumer: {
      type: 'one-to-one',
      target: 'Consumer',
      inverseSide: 'user',
      nullable: true,
    },
    seller: {
      type: 'one-to-one',
      target: 'Seller',
      inverseSide: 'user',
      nullable: true,
    },
    admin: {
      type: 'one-to-one',
      target: 'Admin',
      inverseSide: 'user',
      nullable: true,
    },
  },
});
