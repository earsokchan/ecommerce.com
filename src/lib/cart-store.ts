import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  salePrice: number | null;
  riels: string;
  image: string;
  badges: string[];
  size: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, quantity: number, size: string) => void;
  removeItem: (id: string, size: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.id === item.id && i.size === item.size
      );
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id && i.size === item.size
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    });
  },
  updateQuantity: (id, quantity, size) => {
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === id && item.size === size
            ? { ...item, quantity }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  },
  removeItem: (id, size) => {
    set((state) => ({
      items: state.items.filter((item) => !(item.id === id && item.size === size)),
    }));
  },
  clearCart: () => set({ items: [] }),
  getTotalPrice: () =>
    get().items.reduce(
      (total, item) => total + (item.salePrice || 0) * item.quantity,
      0
    ),
  getTotalItems: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),
}));