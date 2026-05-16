import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// UI Store — ephemeral UI state only
// ============================================================

interface UIState {
  isCartDrawerOpen: boolean
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  openCartDrawer: () => void
  closeCartDrawer: () => void
  toggleCartDrawer: () => void
  openMobileMenu: () => void
  closeMobileMenu: () => void
  toggleMobileMenu: () => void
  openSearch: () => void
  closeSearch: () => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  hideToast: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isCartDrawerOpen: false,
      isMobileMenuOpen: false,
      isSearchOpen: false,
      toast: null,

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),
      toggleCartDrawer: () => set((s) => ({ isCartDrawerOpen: !s.isCartDrawerOpen })),

      openMobileMenu: () => set({ isMobileMenuOpen: true }),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),

      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),

      showToast: (message, type = 'info') => set({ toast: { message, type } }),
      hideToast: () => set({ toast: null }),
    }),
    {
      name: 'wp-ui-state',
      partialize: (s) => ({
        isCartDrawerOpen: s.isCartDrawerOpen,
      }),
    },
  ),
)

// ============================================================
// Recently Viewed Store — client-side tracking
// ============================================================

interface RecentlyViewedState {
  productIds: string[]
  addProduct: (productId: string) => void
  clear: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      productIds: [],
      addProduct: (productId: string) =>
        set((s) => {
          const filtered = s.productIds.filter((id) => id !== productId)
          const updated = [productId, ...filtered].slice(0, 20)
          return { productIds: updated }
        }),
      clear: () => set({ productIds: [] }),
    }),
    { name: 'wp-recently-viewed' },
  ),
)
