import { AppDataSource } from '../config/data-source.js';
import { User } from '../models/User.js';
import { Consumer } from '../models/Consumer.js';
import { Seller } from '../models/Seller.js';
import { Admin } from '../models/Admin.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { ConsumerProduct } from '../models/ConsumerProduct.js';
import { StoreProduct } from '../models/StoreProduct.js';

export const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    await AppDataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: userId },
        relations: ['consumer', 'seller', 'admin']
      });

      if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
      }

      if (user.consumer) {
        await manager.getRepository(ConsumerProduct).delete({ consumerId: user.consumer.id });
        await manager.getRepository(Cart).delete({ consumerId: user.consumer.id });
        await manager.getRepository(Consumer).delete({ id: user.consumer.id });
      }

      if (user.seller) {
        const stores = await manager.getRepository(Store).find({ where: { sellerId: user.seller.id } });
        for (const st of stores) {
          const products = await manager.getRepository(Product).find({ where: { storeId: st.id } });
          for (const p of products) {
            await manager.getRepository(ConsumerProduct).delete({ productId: p.id });
            await manager.getRepository(Cart).delete({ productId: p.id });
            await manager.getRepository(StoreProduct).delete({ productId: p.id });
            await manager.getRepository(Product).delete({ id: p.id });
          }
          await manager.getRepository(StoreProduct).delete({ storeId: st.id });
          await manager.getRepository(Store).delete({ id: st.id });
        }
        await manager.getRepository(Seller).delete({ id: user.seller.id });
      }

      if (user.admin) {
        await manager.getRepository(Admin).delete({ id: user.admin.id });
      }

      await userRepo.delete({ id: userId });
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);

    await AppDataSource.transaction(async (manager) => {
      await manager.getRepository(StoreProduct).delete({ productId });
      await manager.getRepository(ConsumerProduct).delete({ productId });
      await manager.getRepository(Cart).delete({ productId });
      await manager.getRepository(Product).delete({ id: productId });
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id);

    await AppDataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const products = await productRepo.find({ where: { storeId } });

      for (const p of products) {
        await manager.getRepository(ConsumerProduct).delete({ productId: p.id });
        await manager.getRepository(Cart).delete({ productId: p.id });
        await manager.getRepository(StoreProduct).delete({ productId: p.id });
        await productRepo.delete({ id: p.id });
      }

      await manager.getRepository(StoreProduct).delete({ storeId });
      await manager.getRepository(Store).delete({ id: storeId });
    });

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    next(error);
  }
};
