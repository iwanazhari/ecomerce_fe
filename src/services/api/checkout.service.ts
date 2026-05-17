/**
 * Checkout, Order, Shipping & Payment Services — delegates to new API adapter layer.
 */
import {
  createOrder,
  listOrders,
  getOrderByNumber,
  cancelOrder,
  prepareCheckout,
  completeCheckout,
  reorder,
  calculateShipping,
  getCheapestShipping,
  getFastestShipping,
  createSnapFromCart,
  createSnapFromOrder,
  getPaymentStatus,
} from "@/lib/api";
import type {
  Order,
  OrderListParams,
  CreateOrderInput,
  ShippingRate,
  ShippingCalculationInput,
  SnapPayment,
  PaymentInfo,
} from "@/types";

export const checkoutService = {
  // Direct order creation (backend flow)
  createOrder: (data: CreateOrderInput) => createOrder(data),

  // Two-step flow compatibility:
  prepareCheckout: (data: CreateOrderInput) => prepareCheckout(data),
  completeCheckout: (cartId: string) => completeCheckout(cartId),
};

export const orderService = {
  list: (params?: OrderListParams) => listOrders(params),
  getByNumber: (orderNumber: string) => getOrderByNumber(orderNumber),
  reorder: (orderId: string) => reorder(orderId),
  cancel: (orderId: string) => cancelOrder(orderId),
};

export const shippingService = {
  calculate: (data: ShippingCalculationInput) => calculateShipping(data),
  getCheapest: (data: ShippingCalculationInput) => getCheapestShipping(data),
  getFastest: (data: ShippingCalculationInput) => getFastestShipping(data),
};

export const paymentService = {
  createSnapFromCart: (
    cartId: string,
    grossAmount: number,
    customerDetails: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    },
  ) => createSnapFromCart(cartId, grossAmount, customerDetails),
  createSnapFromOrder: (
    orderId: string,
    amount: number,
    paymentType?: "qris" | "gopay" | "bank_transfer" | "credit_card",
  ) => createSnapFromOrder(orderId, amount, paymentType),
  getStatus: (paymentId: string) => getPaymentStatus(paymentId),
};
