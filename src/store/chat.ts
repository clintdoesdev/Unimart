"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, Conversation } from "@/lib/types";
import { CONVERSATIONS } from "@/lib/mock-data";

interface ChatState {
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => void;
  sendOffer: (conversationId: string, amount: number) => void;
  respondToOffer: (
    conversationId: string,
    messageId: string,
    status: "accepted" | "declined"
  ) => void;
  markRead: (conversationId: string) => void;
  totalUnread: () => number;
  startOrGetConversation: (sellerId: string, listingId: string) => string;
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: CONVERSATIONS,
      sendMessage: (conversationId, text) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessagePreview: text,
                  updatedAt: "now",
                  messages: [
                    ...c.messages,
                    { id: `m-${Date.now()}`, from: "me", text, sentAt: nowTime() } as ChatMessage,
                  ],
                }
              : c
          ),
        })),
      sendOffer: (conversationId, amount) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessagePreview: `Offer: ₹${amount}`,
                  updatedAt: "now",
                  messages: [
                    ...c.messages,
                    {
                      id: `m-${Date.now()}`,
                      from: "me",
                      offerAmount: amount,
                      offerStatus: "pending",
                      sentAt: nowTime(),
                    } as ChatMessage,
                  ],
                }
              : c
          ),
        })),
      respondToOffer: (conversationId, messageId, status) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, offerStatus: status } : m
                  ),
                }
              : c
          ),
        })),
      markRead: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
        })),
      totalUnread: () =>
        get().conversations.reduce((sum, c) => sum + c.unreadCount, 0),
      startOrGetConversation: (sellerId, listingId) => {
        const existing = get().conversations.find(
          (c) => c.sellerId === sellerId && c.listingId === listingId
        );
        if (existing) return existing.id;
        const id = `c-${Date.now()}`;
        set((state) => ({
          conversations: [
            {
              id,
              sellerId,
              listingId,
              lastMessagePreview: "",
              updatedAt: "now",
              unreadCount: 0,
              online: false,
              messages: [],
            },
            ...state.conversations,
          ],
        }));
        return id;
      },
    }),
    { name: "unimart-chat", skipHydration: true }
  )
);
