import { EntitySchema } from 'typeorm';

export const Store = new EntitySchema({
  name: 'Store',
  tableName: 'stores',
  columns: {
    id: { type: Number, primary: true, generated: true },
    title: { type: String, length: 255 },
    sellerId: { name: 'seller_id', type: Number, unique: true },
  },
  relations: {
    seller: {
      type: 'one-to-one',
      target: 'Seller',
      inverseSide: 'store',
      joinColumn: { name: 'seller_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
    },
    products: {
      type: 'one-to-many',
      target: 'Product',
      inverseSide: 'store',
    },
    storeProducts: {
      type: 'one-to-many',
      target: 'StoreProduct',
      inverseSide: 'store',
    },
  },
});
