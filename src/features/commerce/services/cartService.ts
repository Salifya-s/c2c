import type {CartLine, CartState, Product, Seller} from '../types/commerce';

export const CART_STORAGE_KEY = 'zamcomm-cart-v1';

export const emptyCart: CartState = {items: []};

export const readCart = (): CartState => {
  if (typeof window === 'undefined') return emptyCart;
  try {
    return JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || 'null') ?? emptyCart;
  } catch {
    return emptyCart;
  }
};

export const saveCart = (cart: CartState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

export const addCartItem = (cart: CartState, merchant: Seller, product: Product, quantity = 1, variant?: string): CartState => {
  const line: CartLine = {merchantId: merchant.id, productId: product.id, quantity, variant};
  if (!cart.merchantId || cart.items.length === 0) return {merchantId: merchant.id, items: [line]};
  if (cart.merchantId !== merchant.id) return cart;

  const existing = cart.items.find((item) => item.productId === product.id && item.variant === variant);
  if (!existing) return {...cart, items: [...cart.items, line]};

  return {
    ...cart,
    items: cart.items.map((item) =>
      item.productId === product.id && item.variant === variant ? {...item, quantity: item.quantity + quantity} : item
    )
  };
};

export const updateCartQuantity = (cart: CartState, productId: string, quantity: number) => ({
  ...cart,
  items: cart.items.map((item) => (item.productId === productId ? {...item, quantity} : item)).filter((item) => item.quantity > 0)
});

export const clearCart = (): CartState => emptyCart;
