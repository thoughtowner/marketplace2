import { EntitySchema } from 'typeorm';

export const Consumer = new EntitySchema({
  name: 'Consumer',
  tableName: 'consumers',
  columns: {
    id: { type: Number, primary: true, generated: true },
    money: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    userId: { name: 'user_id', type: Number, unique: true },
  },
  relations: {
    user: {
      type: 'one-to-one',
      target: 'User',
      inverseSide: 'consumer',
      joinColumn: { name: 'user_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
      nullable: true,
    },
    cartItems: {
      type: 'one-to-many',
      target: 'Cart',
      inverseSide: 'consumer',
    },
    purchases: {
      type: 'one-to-many',
      target: 'ConsumerProduct',
      inverseSide: 'consumer',
    },
  },
});
