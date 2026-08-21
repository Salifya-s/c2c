import type {CartLine, CartState, MerchantCartGroup, MultiMerchantCartState, Product, Seller} from '../types/commerce';

export const CART_STORAGE_KEY = 'zamcomm-cart-v1';
export const MULTI_CART_STORAGE_KEY = 'zamcomm-multi-cart-v2';

export const emptyCart: CartState = {items: []};
export const emptyMultiCart: MultiMerchantCartState = {groups: []};

/**
 * Reads the multi-merchant cart from browser storage.
 *
 * Swap point for production:
 * replace this localStorage read with an authenticated cart API/database call,
 * while keeping the returned `MultiMerchantCartState` shape stable for the UI.
 */
export const readMultiCart = (): MultiMerchantCartState => {
  if (typeof window === 'undefined') return emptyMultiCart;
  try {
    const storedMultiCart = JSON.parse(window.localStorage.getItem(MULTI_CART_STORAGE_KEY) || 'null') as MultiMerchantCartState | null;
    if (storedMultiCart?.groups?.length) return normaliseMultiCart(storedMultiCart);

    const legacyCart = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || 'null') as CartState | null;
    if (legacyCart?.merchantId && legacyCart.items.length > 0) {
      return {
        activeMerchantId: legacyCart.merchantId,
        groups: [{merchantId: legacyCart.merchantId, items: legacyCart.items, updatedAt: new Date().toISOString()}]
      };
    }
  } catch {
    return emptyMultiCart;
  }
  return emptyMultiCart;
};

/**
 * Persists the whole cart store locally.
 *
 * In a real backend, this would become an upsert for the signed-in customer.
 */
export const saveMultiCart = (cart: MultiMerchantCartState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MULTI_CART_STORAGE_KEY, JSON.stringify(normaliseMultiCart(cart)));
};

/**
 * Reads the active merchant cart for checkout screens that still process one
 * merchant group at a time. The multi-cart source remains the single source of truth.
 */
export const readCart = (merchantId?: string): CartState => {
  if (typeof window === 'undefined') return emptyCart;
  const multiCart = readMultiCart();
  const activeMerchantId = merchantId ?? multiCart.activeMerchantId ?? multiCart.groups[0]?.merchantId;
  const group = multiCart.groups.find((item) => item.merchantId === activeMerchantId);
  return group ? {merchantId: group.merchantId, items: group.items} : emptyCart;
};

export const saveCart = (cart: CartState) => {
  if (typeof window === 'undefined') return;
  if (!cart.merchantId || cart.items.length === 0) {
    saveMultiCart(removeCartGroup(readMultiCart(), cart.merchantId ?? readMultiCart().activeMerchantId));
    return;
  }

  const multiCart = readMultiCart();
  saveMultiCart({
    activeMerchantId: cart.merchantId,
    groups: upsertCartGroup(multiCart.groups, {
      merchantId: cart.merchantId,
      items: cart.items,
      updatedAt: new Date().toISOString()
    })
  });
};

/**
 * Adds an item to a merchant-specific cart group without clearing other stores.
 *
 * UI usage:
 * - discovery product cards
 * - storefront product cards
 * - future assistant "add to cart" actions
 */
export const addCartItem = (cart: MultiMerchantCartState, merchant: Seller, product: Product, quantity = 1, variant?: string): MultiMerchantCartState => {
  const line: CartLine = {merchantId: merchant.id, productId: product.id, quantity, variant};
  const existingGroup = cart.groups.find((group) => group.merchantId === merchant.id);
  const items = existingGroup?.items ?? [];
  const existing = items.find((item) => item.productId === product.id && item.variant === variant);

  const nextItems = existing
    ? items.map((item) => (item.productId === product.id && item.variant === variant ? {...item, quantity: item.quantity + quantity} : item))
    : [...items, line];

  return {
    activeMerchantId: merchant.id,
    groups: upsertCartGroup(cart.groups, {merchantId: merchant.id, items: nextItems, updatedAt: new Date().toISOString()})
  };
};

export const updateCartQuantity = (cart: CartState, productId: string, quantity: number) => {
  const nextCart = {
    ...cart,
    items: cart.items.map((item) => (item.productId === productId ? {...item, quantity} : item)).filter((item) => item.quantity > 0)
  };
  saveCart(nextCart);
  return nextCart;
};

export const clearCart = (merchantId?: string): CartState => {
  saveMultiCart(removeCartGroup(readMultiCart(), merchantId));
  return emptyCart;
};

export const getCartItemCount = (cart: MultiMerchantCartState) =>
  cart.groups.reduce((total, group) => total + group.items.reduce((groupTotal, item) => groupTotal + item.quantity, 0), 0);

export const getMerchantCartQuantity = (group: MerchantCartGroup) =>
  group.items.reduce((total, item) => total + item.quantity, 0);

export const setActiveMerchantCart = (merchantId: string) => {
  const cart = readMultiCart();
  saveMultiCart({...cart, activeMerchantId: merchantId});
};

export const removeCartGroup = (cart: MultiMerchantCartState, merchantId?: string): MultiMerchantCartState => {
  const nextGroups = merchantId ? cart.groups.filter((group) => group.merchantId !== merchantId) : [];
  return {activeMerchantId: nextGroups[0]?.merchantId, groups: nextGroups};
};

const upsertCartGroup = (groups: MerchantCartGroup[], nextGroup: MerchantCartGroup) => [
  nextGroup,
  ...groups.filter((group) => group.merchantId !== nextGroup.merchantId)
];

const normaliseMultiCart = (cart: MultiMerchantCartState): MultiMerchantCartState => ({
  activeMerchantId: cart.activeMerchantId ?? cart.groups[0]?.merchantId,
  groups: cart.groups.filter((group) => group.items.length > 0)
});
