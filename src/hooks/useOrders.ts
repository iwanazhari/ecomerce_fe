import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUIStore } from '@/store'
import {
  checkoutService,
  orderService,
  wishlistService,
  loyaltyService,
  notificationService,
  shippingService,
  paymentService,
} from '@/services/api'
import type {
  CreateOrderInput,
  ShippingCalculationInput,
  OrderListParams,
  NotificationListParams,
  LoyaltyListParams,
} from '@/types'

// ============================================================
// Order Keys
// ============================================================

const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderListParams) => [...orderKeys.lists(), params] as const,
  detail: (orderNumber: string) => [...orderKeys.all, 'detail', orderNumber] as const,
}

// ============================================================
// Wishlist Keys
// ============================================================

const wishlistKeys = {
  all: ['wishlist'] as const,
  current: () => [...wishlistKeys.all, 'current'] as const,
}

// ============================================================
// Loyalty Keys
// ============================================================

const loyaltyKeys = {
  all: ['loyalty'] as const,
  current: () => [...loyaltyKeys.all, 'current'] as const,
  transactions: (params?: LoyaltyListParams) => [...loyaltyKeys.all, 'transactions', params] as const,
}

// ============================================================
// Notification Keys
// ============================================================

const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: NotificationListParams) => [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

// ============================================================
// Shipping Keys
// ============================================================

const shippingKeys = {
  all: ['shipping'] as const,
  calculate: (data: ShippingCalculationInput) => [...shippingKeys.all, 'calculate', data] as const,
}

// ============================================================
// Checkout
// ============================================================

/** Legacy: one-step checkout (prepare + complete) */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrderInput) => checkoutService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

/** Step 1: Prepare cart (email, address, shipping) → returns cart ID */
export function usePrepareCheckout() {
  return useMutation({
    mutationFn: (data: CreateOrderInput) => checkoutService.prepareCheckout(data),
  })
}

/** Step 2: Complete checkout (after Snap payment) → creates order */
export function useCompleteCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cartId: string) => checkoutService.completeCheckout(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

/** Create Midtrans Snap token from cart data */
export function useCreateSnap() {
  return useMutation({
    mutationFn: ({
      cartId,
      grossAmount,
      customerDetails,
    }: {
      cartId: string
      grossAmount: number
      customerDetails: {
        first_name?: string
        last_name?: string
        email?: string
        phone?: string
      }
    }) => paymentService.createSnapFromCart(cartId, grossAmount, customerDetails),
  })
}

// ============================================================
// Orders
// ============================================================

export function useOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params ?? {}),
    queryFn: () => orderService.list(params).then((r) => r.data),
    staleTime: 0,
  })
}

export function useOrder(orderNumber: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderNumber),
    queryFn: () => orderService.getByNumber(orderNumber).then((r) => r.data),
    enabled: !!orderNumber,
    staleTime: 0,
  })
}

export function useReorder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => orderService.reorder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

// ============================================================
// Wishlist
// ============================================================

export function useWishlist(enabled: boolean = true) {
  return useQuery({
    queryKey: wishlistKeys.current(),
    queryFn: () => wishlistService.get().then((r) => r.data),
    enabled,
    staleTime: 1000 * 60 * 2,
  })
}

export function useAddToWishlist() {
  const queryClient = useQueryClient()
  const showToast = useUIStore((s) => s.showToast)

  return useMutation({
    mutationFn: (productId: string) => wishlistService.add(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.current() })
      const previous = queryClient.getQueryData(wishlistKeys.current())

      queryClient.setQueryData(wishlistKeys.current(), (old: { items: unknown[] } | undefined) => {
        if (!old) return old
        return { ...old, items: [...old.items, { productId }] }
      })

      return { previous }
    },
    onError: (err, _vars, context) => {
      console.error('Failed to add to wishlist:', err)
      if (context?.previous) {
        queryClient.setQueryData(wishlistKeys.current(), context.previous)
      }
      showToast('Gagal menambahkan ke wishlist', 'error')
    },
    onSuccess: () => {
      showToast('Berhasil ditambahkan ke wishlist', 'success')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.current() })
    },
  })
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => wishlistService.remove(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.current() })
      const previous = queryClient.getQueryData(wishlistKeys.current())

      queryClient.setQueryData(wishlistKeys.current(), (old: { items: { productId: string }[] } | undefined) => {
        if (!old) return old
        return { ...old, items: old.items.filter((item) => item.productId !== productId) }
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(wishlistKeys.current(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.current() })
    },
  })
}

// ============================================================
// Loyalty
// ============================================================

export function useLoyalty() {
  return useQuery({
    queryKey: loyaltyKeys.current(),
    queryFn: () => loyaltyService.get().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useLoyaltyTransactions(params?: LoyaltyListParams) {
  return useQuery({
    queryKey: loyaltyKeys.transactions(params),
    queryFn: () => loyaltyService.transactions(params).then((r) => r.data),
  })
}

// ============================================================
// Notifications
// ============================================================

export function useNotifications(params?: NotificationListParams) {
  return useQuery({
    queryKey: notificationKeys.list(params ?? {}),
    queryFn: () => notificationService.list(params).then((r) => r.data),
    staleTime: 0,
  })
}

export function useUnreadCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount().then((r) => r.data),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30, // 30 sec
    refetchInterval: options?.enabled ? 30000 : false,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

// ============================================================
// Shipping
// ============================================================

export function useCalculateShipping() {
  return useMutation({
    mutationFn: (data: ShippingCalculationInput) =>
      shippingService.calculate(data),
  })
}
