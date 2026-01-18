import { EntitySchema } from 'typeorm';

export const Admin = new EntitySchema({
  name: 'Admin',
  tableName: 'admins',
  columns: {
    id: { type: Number, primary: true, generated: true },
    userId: { name: 'user_id', type: Number, unique: true },
  },
  relations: {
    user: {
      type: 'one-to-one',
      target: 'User',
      inverseSide: 'admin',
      joinColumn: { name: 'user_id', referencedColumnName: 'id', onDelete: 'CASCADE' },
    },
  },
});
