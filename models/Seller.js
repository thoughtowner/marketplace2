import { EntitySchema } from 'typeorm';

export const Seller = new EntitySchema({
  name: 'Seller',
  tableName: 'sellers',
  columns: {
    id: { type: Number, primary: true, generated: true },
    money: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    userId: { name: 'user_id', type: Number, unique: true },
  },
  relations: {
    user: {
      type: 'one-to-one',
      target: 'User',
      inverseSide: 'seller',
      joinColumn: { name: 'user_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
      nullable: true,
    },
    store: {
      type: 'one-to-one',
      target: 'Store',
      inverseSide: 'seller',
    },
    stores: {
      type: 'one-to-many',
      target: 'Store',
      inverseSide: 'seller',
    },
  },
});
