import { useState, useEffect } from 'react';
import { Product } from './api';

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderStatus = 'PENDING' | 'PAID';

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  shippingFee: number;
  totalAmount: number;
  address: string;
  status: OrderStatus;
};

type ShopStoreState = {
  // Auth & SecureStore & App Lock (Ch.5 & Ch.8)
  token: string | null;
  user: { name: string; email: string } | null;
  isAppLocked: boolean;
  loginSuccess: (token: string, user: { name: string; email: string }) => void;
  logout: () => void;
  setAppLocked: (locked: boolean) => void;

  // Cart & Scanner & Location (Ch.6 & Ch.7)
  items: CartItem[];
  scannedBarcode: string;
  distanceKm: number;
  setScannedBarcode: (code: string) => void;
  setDistanceKm: (km: number) => void;
  addToCart: (product: Product, qty?: number) => void;
  updateQty: (productId: number, delta: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalCount: () => number;

  // Orders Journey: PENDING -> PAID (Ch.6 & Ch.9)
  orders: Order[];
  createOrderPending: (address: string, shippingFee: number) => Order;
  payOrder: (orderId: string) => void;
};

let memoryState: ShopStoreState = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secure_init_token',
  user: { name: 'Bùi Công Nguyên', email: 'nguyenbui@shopai.vn' },
  isAppLocked: false,

  loginSuccess: (token, user) => {
    memoryState = { ...memoryState, token, user, isAppLocked: false };
    notify();
  },
  logout: () => {
    memoryState = { ...memoryState, token: null, user: null, isAppLocked: false };
    notify();
  },
  setAppLocked: (locked: boolean) => {
    memoryState = { ...memoryState, isAppLocked: locked };
    notify();
  },

  items: [
    {
      product: {
        id: 1,
        name: 'Tai nghe Bluetooth Chống Ồn AI',
        price: 890000,
        category: 'electronics',
        categoryName: 'Điện tử',
        barcode: '8930001',
        description: 'Tai nghe không dây tích hợp khử tiếng ồn chủ động ANC, pin 30 giờ.',
        image: 'https://picsum.photos/id/1/400/400',
      },
      quantity: 1,
    },
  ],
  scannedBarcode: '',
  distanceKm: 5.2,

  setScannedBarcode: (code: string) => {
    memoryState = { ...memoryState, scannedBarcode: code };
    notify();
  },
  setDistanceKm: (km: number) => {
    memoryState = { ...memoryState, distanceKm: km };
    notify();
  },
  addToCart: (product: Product, qty = 1) => {
    const current = [...memoryState.items];
    const idx = current.findIndex(i => i.product.id === product.id);
    if (idx > -1) {
      current[idx] = { ...current[idx], quantity: current[idx].quantity + qty };
    } else {
      current.push({ product, quantity: qty });
    }
    memoryState = { ...memoryState, items: current };
    notify();
  },
  updateQty: (productId: number, delta: number) => {
    const updated = memoryState.items
      .map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
      .filter(item => item.quantity > 0);
    memoryState = { ...memoryState, items: updated };
    notify();
  },
  removeFromCart: (productId: number) => {
    memoryState = {
      ...memoryState,
      items: memoryState.items.filter(i => i.product.id !== productId),
    };
    notify();
  },
  clearCart: () => {
    memoryState = { ...memoryState, items: [] };
    notify();
  },
  getTotalPrice: () =>
    memoryState.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  getTotalCount: () =>
    memoryState.items.reduce((sum, item) => sum + item.quantity, 0),

  orders: [
    {
      id: 'ORD-23672641-01',
      createdAt: '14/10/2026 22:30',
      items: [
        {
          product: {
            id: 2,
            name: 'Bàn phím Cơ Không Dây RGB',
            price: 1250000,
            category: 'electronics',
            categoryName: 'Điện tử',
            barcode: '8930002',
            description: 'Switch Hotswap êm ái.',
            image: 'https://picsum.photos/id/2/400/400',
          },
          quantity: 1,
        },
      ],
      shippingFee: 26000,
      totalAmount: 1276000,
      address: '12 Nguyễn Văn Bảo, P.4, Gò Vấp, TP.HCM',
      status: 'PENDING',
    },
  ],

  createOrderPending: (address: string, shippingFee: number) => {
    const subTotal = memoryState.getTotalPrice();
    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleString('vi-VN'),
      items: [...memoryState.items],
      shippingFee,
      totalAmount: subTotal + shippingFee,
      address,
      status: 'PENDING',
    };
    // Checklist B: Chỉ xóa giỏ khi tạo đơn PENDING thành công
    memoryState = {
      ...memoryState,
      orders: [newOrder, ...memoryState.orders],
      items: [],
    };
    notify();
    return newOrder;
  },

  payOrder: (orderId: string) => {
    const updatedOrders = memoryState.orders.map(o =>
      o.id === orderId ? { ...o, status: 'PAID' as OrderStatus } : o
    );
    memoryState = { ...memoryState, orders: updatedOrders };
    notify();
  },
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export function useCartStore(): ShopStoreState;
export function useCartStore<T>(selector: (state: ShopStoreState) => T): T;
export function useCartStore<T>(selector?: (state: ShopStoreState) => T) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return selector ? selector(memoryState) : memoryState;
}