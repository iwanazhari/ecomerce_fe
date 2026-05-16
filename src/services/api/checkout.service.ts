/**
 * Checkout, Order, Shipping & Payment Services — delegates to Medusa adapter layer.
 */
import {
  listOrders,
  getOrderByNumber,
  prepareCheckout,
  completeCheckout,
  createOrder,
  reorder,
  calculateShipping,
  getCheapestShipping,
  getFastestShipping,
  createSnapFromCart,
  getPaymentStatus,
} from '@/lib/medusa'
import type {
  Order,
  OrderListParams,
  CreateOrderInput,
  ShippingRate,
  ShippingCalculationInput,
  SnapPayment,
  PaymentInfo,
} from '@/types'

export const checkoutService = {
  // Legacy: prepare + complete in one step
  createOrder: (data: CreateOrderInput) => createOrder(data),

  // New two-step flow:
  // Step 1: prepare cart (email, address, shipping) → returns cart ID
  prepareCheckout: (data: CreateOrderInput) => prepareCheckout(data),
  // Step 2: complete checkout → creates order
  completeCheckout: (cartId: string) => completeCheckout(cartId),
}

export const orderService = {
  list: (params?: OrderListParams) => listOrders(params),
  getByNumber: (orderNumber: string) => getOrderByNumber(orderNumber),
  reorder: (orderId: string) => reorder(orderId),
}

export const shippingService = {
  calculate: (data: ShippingCalculationInput) => calculateShipping(data),
  getCheapest: (data: ShippingCalculationInput) => getCheapestShipping(data),
  getFastest: (data: ShippingCalculationInput) => getFastestShipping(data),
}

export const paymentService = {
  createSnapFromCart: (
    cartId: string,
    grossAmount: number,
    customerDetails: {
      first_name?: string
      last_name?: string
      email?: string
      phone?: string
    },
  ) => createSnapFromCart(cartId, grossAmount, customerDetails),
  getStatus: (paymentId: string) => getPaymentStatus(paymentId),
}
