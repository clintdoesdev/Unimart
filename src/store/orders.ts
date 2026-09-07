"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HandoverMethod, Order, OrderItem } from "@/lib/types";
import { ORDERS } from "@/lib/mock-data";

interface PlaceOrderInput {
  sellerId: string;
  items: OrderItem[];
  subtotal: number;
  handoverCost: number;
  discount: number;
  total: number;
  handoverMethod: HandoverMethod;
}

interface OrdersState {
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  markCollected: (orderId: string) => void;
  markReviewed: (orderId: string) => void;
  getOrder: (orderId: string) => Order | undefined;
}

function randomPickupCode(): string {
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

let orderCounter = 2300;

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: ORDERS,
      placeOrder: (input) => {
        orderCounter += 1;
        const order: Order = {
          id: `ORD-${orderCounter}`,
          role: "buying",
          sellerId: input.sellerId,
          buyerName: "You",
          items: input.items,
          subtotal: input.subtotal,
          handoverCost: input.handoverCost,
          discount: input.discount,
          total: input.total,
          handoverMethod: input.handoverMethod,
          status: "paid",
          pickupCode: randomPickupCode(),
          timeline: [
            { label: "Paid", timestamp: "Just now", done: true },
            { label: "Dropped at locker", done: false },
            { label: "Collected by you", done: false },
          ],
          createdAt: "Just now",
          reviewed: false,
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },
      markCollected: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "completed",
                  timeline: o.timeline.map((step) =>
                    step.done ? step : { ...step, done: true, timestamp: "Just now" }
                  ),
                }
              : o
          ),
        })),
      markReviewed: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, reviewed: true } : o
          ),
        })),
      getOrder: (orderId) => get().orders.find((o) => o.id === orderId),
    }),
    { name: "unimart-orders", skipHydration: true }
  )
);
