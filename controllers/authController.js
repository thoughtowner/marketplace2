import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../models/User.js';
import { Consumer } from '../models/Consumer.js';
import { Seller } from '../models/Seller.js';
import { Admin } from '../models/Admin.js';
import { Store } from '../models/Store.js';
import { Cart } from '../models/Cart.js';

export const register = async (req, res, next) => {
  try {
    const { login, password, role } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { login } });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = userRepository.create({
      login,
      hashPassword
    });

    await userRepository.save(user);

    let roleEntity;
    if (role === 'consumer') {
      const consumerRepository = AppDataSource.getRepository(Consumer);
      roleEntity = consumerRepository.create({
        userId: user.id,
        money: 0
      });
      await consumerRepository.save(roleEntity);

      const cartRepository = AppDataSource.getRepository(Cart);
    } else if (role === 'seller') {
      const sellerRepository = AppDataSource.getRepository(Seller);
      roleEntity = sellerRepository.create({
        userId: user.id,
        money: 0
      });
      await sellerRepository.save(roleEntity);
    } else if (role === 'admin') {
      const adminRepository = AppDataSource.getRepository(Admin);
      roleEntity = adminRepository.create({
        userId: user.id
      });
      await adminRepository.save(roleEntity);
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        login: user.login,
        role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { login, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { login },
      relations: ['consumer', 'seller', 'admin']
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    let role = null;
    if (user.consumer) role = 'consumer';
    else if (user.seller) role = 'seller';
    else if (user.admin) role = 'admin';

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        login: user.login,
        role
      }
    });
  } catch (error) {
    next(error);
  }
};
