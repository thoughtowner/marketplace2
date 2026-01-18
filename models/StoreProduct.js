import { EntitySchema } from 'typeorm';

export const StoreProduct = new EntitySchema({
  name: 'StoreProduct',
  tableName: 'store_to_product',
  uniques: [{ columns: ['storeId', 'productId'] }],
  columns: {
    id: { type: Number, primary: true, generated: true },
    storeId: { name: 'store_id', type: Number },
    productId: { name: 'product_id', type: Number },
    quantity: { type: 'int', default: 0 },
  },
  relations: {
    store: {
      type: 'many-to-one',
      target: 'Store',
      inverseSide: 'storeProducts',
      joinColumn: { name: 'store_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      inverseSide: 'storeProducts',
      joinColumn: { name: 'product_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
    },
  },
});
