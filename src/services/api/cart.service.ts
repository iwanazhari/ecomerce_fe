/**
 * Cart Service — delegates to API adapter layer.
 */
import { getCart, addItem, updateItem, removeItem } from "@/lib/api";
import type { Cart, AddCartItemInput, UpdateCartItemInput } from "@/types";

export const cartService = {
  get: () => getCart(),
  addItem: (data: AddCartItemInput) => addItem(data),
  updateItem: (itemId: string, data: UpdateCartItemInput) =>
    updateItem(itemId, data),
  removeItem: (itemId: string) => removeItem(itemId),
};
