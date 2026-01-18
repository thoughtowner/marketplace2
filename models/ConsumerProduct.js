import { EntitySchema } from 'typeorm';

export const ConsumerProduct = new EntitySchema({
  name: 'ConsumerProduct',
  tableName: 'consumer_to_product',
  columns: {
    id: { type: Number, primary: true, generated: true },
    consumerId: { name: 'consumer_id', type: Number },
    productId: { name: 'product_id', type: Number },
    quantity: { type: 'int' },
    purchaseDate: { name: 'purchase_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' },
  },
  relations: {
    consumer: {
      type: 'many-to-one',
      target: 'Consumer',
      inverseSide: 'purchases',
      joinColumn: { name: 'consumer_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      inverseSide: 'consumerProducts',
      joinColumn: { name: 'product_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
    },
  },
});
