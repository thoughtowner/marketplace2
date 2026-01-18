import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    login: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['consumer', 'seller', 'admin'], {
      errorMap: () => ({ message: 'Role must be consumer, seller, or admin' })
    })
  })
});

export const loginSchema = z.object({
  body: z.object({
    login: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
});

export const depositMoneySchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive('Amount must be positive')
  })
});

export const withdrawMoneySchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive('Amount must be positive')
  })
});

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    price: z.coerce.number().positive('Price must be positive'),
    quantity: z.coerce.number().int().min(0, 'Quantity must be non-negative').optional()
  })
});

export const createStoreSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required')
  })
});

export const updateProductSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    price: z.coerce.number().positive('Price must be positive').optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Product ID must be a number')
  })
});

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive('Product ID must be a positive number'),
    quantity: z.coerce.number().int().positive('Quantity must be a positive number')
  })
});

export const removeFromCartSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Product ID must be a number')
  })
});

export const updateCartQuantitySchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1')
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Product ID must be a number')
  })
});

export const increaseProductQuantitySchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().positive('Quantity must be a positive number')
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Product ID must be a number')
  })
});
