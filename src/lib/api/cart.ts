/**
 * Cart Adapter — client-side cart with localStorage + API integration.
 *
 * Since the Express backend doesn't expose a cart API, cart is managed client-side.
 * Cart items are stored in localStorage, and product data is fetched from the API.
 * The cart is submitted directly when creating an order via POST /api/orders.
 */

import { mapBackendCartItem } from "@/lib/api/mappers";
import type {
  Cart,
  CartItem,
  AddCartItemInput,
  UpdateCartItemInput,
  ApiResponse,
} from "@/types";

const CART_KEY = "wp_cart_items";

function getStoredItems(): Record<string, unknown>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const items: Record<string, unknown>[] = JSON.parse(raw);

    // Migration: remove items without product snapshot data (old format)
    const migrated = items.filter((item) => item.productTitle);
    if (migrated.length !== items.length) {
      localStorage.setItem(CART_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return [];
  }
}

function storeItems(items: Record<string, unknown>[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function buildCart(items: Record<string, unknown>[]): Cart {
  const cartItems = items.map((item) => mapBackendCartItem(item));
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    id: "local-cart",
    status: "ACTIVE",
    items: cartItems,
    subtotal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
// Get Cart
// ─────────────────────────────────────────────

export async function getCart(): Promise<ApiResponse<Cart>> {
  try {
    const storedItems = getStoredItems();
    return { success: true, data: buildCart(storedItems) };
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: "CART_GET_FAILED", message: error.message } },
    } as any;
  }
}

// ─────────────────────────────────────────────
// Add Item
// ─────────────────────────────────────────────

export async function addItem(
  input: AddCartItemInput,
): Promise<ApiResponse<Cart>> {
  try {
    const storedItems = getStoredItems();

    // Check if item already exists (by variantId or productId)
    const existingIndex = storedItems.findIndex(
      (item) =>
        (item.variantId as string) === input.variantId ||
        ((item.variantId as string) === "" &&
          (item.productId as string) === input.productId),
    );

    if (existingIndex >= 0) {
      // Increment quantity
      const existing = storedItems[existingIndex] as Record<string, unknown>;
      const currentQty = (existing.quantity as number) ?? 0;
      storedItems[existingIndex] = {
        ...existing,
        quantity: currentQty + input.quantity,
      };
    } else {
      storedItems.push({
        id: `cart-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        // Store product snapshot for cart display
        productTitle: input.productTitle,
        productSlug: input.productSlug,
        productThumbnail: input.productThumbnail,
        variantTitle: input.variantTitle,
        price: input.price,
      });
    }

    storeItems(storedItems);
    return { success: true, data: buildCart(storedItems) };
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: "CART_ADD_FAILED", message: error.message } },
    } as any;
  }
}

// ─────────────────────────────────────────────
// Update Item
// ─────────────────────────────────────────────

export async function updateItem(
  itemId: string,
  input: UpdateCartItemInput,
): Promise<ApiResponse<Cart>> {
  try {
    const storedItems = getStoredItems();
    const index = storedItems.findIndex(
      (item) => (item.id as string) === itemId,
    );

    if (index < 0) {
      throw new Error("Cart item not found");
    }

    if (input.quantity <= 0) {
      storedItems.splice(index, 1);
    } else {
      storedItems[index] = {
        ...(storedItems[index] as Record<string, unknown>),
        quantity: input.quantity,
      };
    }

    storeItems(storedItems);
    return { success: true, data: buildCart(storedItems) };
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: "CART_UPDATE_FAILED", message: error.message } },
    } as any;
  }
}

// ─────────────────────────────────────────────
// Remove Item
// ─────────────────────────────────────────────

export async function removeItem(itemId: string): Promise<ApiResponse<Cart>> {
  try {
    const storedItems = getStoredItems().filter(
      (item) => (item.id as string) !== itemId,
    );
    storeItems(storedItems);
    return { success: true, data: buildCart(storedItems) };
  } catch (error: any) {
    return {
      success: false,
      data: undefined as any,
      meta: { error: { code: "CART_REMOVE_FAILED", message: error.message } },
    } as any;
  }
}

// ─────────────────────────────────────────────
// Clear cart (after checkout)
// ─────────────────────────────────────────────

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

// ─────────────────────────────────────────────
// Get cart items for order creation
// ─────────────────────────────────────────────

export function getCartItemsForOrder(): Record<string, unknown>[] {
  return getStoredItems();
}
