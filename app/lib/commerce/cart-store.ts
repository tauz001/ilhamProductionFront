import {create} from 'zustand';
import {persist} from 'zustand/middleware';

type DrawerKind = 'cart' | 'wishlist' | 'menu' | 'search' | null;

type Store = {
  // lines: CartLine[];
  wishlist: string[];
  drawer: DrawerKind;
  openDrawer: (k: DrawerKind) => void;
  closeDrawer: () => void;
  // addToCart: (p: Product, variantIndex: number, qty?: number) => void;
  // removeLine: (id: string) => void;
  // setQty: (id: string, qty: number) => void;
  toggleWishlist: (handle: string) => void;
  // totalQty: () => number;
  // subtotal: () => number;
};

//image

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      wishlist: [],
      drawer: null,

      openDrawer: (k) => set({drawer: k}),
      closeDrawer: () => set({drawer: null}),

      toggleWishlist: (h) => {
        const w = get().wishlist;

        set({
          wishlist: w.includes(h)
            ? w.filter((x) => x !== h)
            : [...w, h],
        });
      },
    }),
    {
      name: 'ilham-store',
      partialize: (s) => ({
        wishlist: s.wishlist,
      }),
    },
  ),
);
