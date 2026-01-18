import { EntitySchema } from 'typeorm';

export const Product = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    id: { type: Number, primary: true, generated: true },
    title: { type: String, length: 255 },
    price: { type: 'decimal', precision: 10, scale: 2 },
    storeId: { name: 'store_id', type: Number },
  },
  relations: {
    store: {
      type: 'many-to-one',
      target: 'Store',
      inverseSide: 'products',
      joinColumn: { name: 'store_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
    },
    carts: {
      type: 'one-to-many',
      target: 'Cart',
      inverseSide: 'product',
    },
    consumerProducts: {
      type: 'one-to-many',
      target: 'ConsumerProduct',
      inverseSide: 'product',
    },
    storeProducts: {
      type: 'one-to-many',
      target: 'StoreProduct',
      inverseSide: 'product',
    },
  },
});
