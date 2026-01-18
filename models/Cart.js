import { EntitySchema } from 'typeorm';

export const Cart = new EntitySchema({
  name: 'Cart',
  tableName: 'carts',
  uniques: [{ columns: ['consumerId', 'productId'] }],
  columns: {
    id: { type: Number, primary: true, generated: true },
    consumerId: { name: 'consumer_id', type: Number },
    productId: { name: 'product_id', type: Number },
    quantity: { type: 'int', default: 1 },
  },
  relations: {
    consumer: {
      type: 'many-to-one',
      target: 'Consumer',
      inverseSide: 'cartItems',
      joinColumn: { name: 'consumer_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      inverseSide: 'carts',
      joinColumn: { name: 'product_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
    },
  },
});
