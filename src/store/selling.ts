"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Condition, HandoverMethod, Listing } from "@/lib/types";
import { LISTINGS } from "@/lib/mock-data";

export const MY_SELLER_ID = "s1";

export interface NewListingInput {
  title: string;
  price: number;
  condition: Condition;
  description: string;
  handover: HandoverMethod[];
  photos: number;
  status: "live" | "draft";
}

interface SellingState {
  myListings: Listing[];
  addListing: (input: NewListingInput) => Listing;
  setListingStatus: (id: string, status: Listing["status"]) => void;
}

const seeded = LISTINGS.filter((l) => l.sellerId === MY_SELLER_ID).map((l, i) =>
  i === 1 ? { ...l, status: "draft" as const } : i === 2 ? { ...l, status: "sold" as const } : l
);

let listingCounter = 900;

export const useSellingStore = create<SellingState>()(
  persist(
    (set) => ({
      myListings: seeded,
      addListing: (input) => {
        listingCounter += 1;
        const listing: Listing = {
          id: `my-${listingCounter}`,
          title: input.title,
          price: input.price,
          category: "textbooks",
          department: "CSE",
          condition: input.condition,
          description: input.description,
          photos: input.photos,
          sellerId: MY_SELLER_ID,
          distanceMeters: 0,
          location: "North Campus",
          postedAt: "Just now",
          status: input.status,
          saves: 0,
          views: 0,
          free: input.price === 0,
          handover: input.handover.length ? input.handover : ["locker"],
        };
        set((state) => ({ myListings: [listing, ...state.myListings] }));
        return listing;
      },
      setListingStatus: (id, status) =>
        set((state) => ({
          myListings: state.myListings.map((l) => (l.id === id ? { ...l, status } : l)),
        })),
    }),
    { name: "unimart-selling", skipHydration: true }
  )
);
