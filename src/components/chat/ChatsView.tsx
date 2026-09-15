"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MessageCircle, Paperclip, Search, Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { EmptyState } from "@/components/ui/EmptyState";
import { useChatStore } from "@/store/chat";
import { getListing, getSeller } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

export function ChatsView({ activeId }: { activeId?: string }) {
  const router = useRouter();
  const conversations = useChatStore((s) => s.conversations);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const sendOffer = useChatStore((s) => s.sendOffer);
  const respondToOffer = useChatStore((s) => s.respondToOffer);
  const markRead = useChatStore((s) => s.markRead);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");

  const active = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    if (activeId) markRead(activeId);
  }, [activeId, markRead]);

  const filteredList = conversations
    .filter((c) => getSeller(c.sellerId)?.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.id === activeId ? -1 : b.id === activeId ? 1 : 0));

  function submitMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    sendMessage(active.id, draft.trim());
    setDraft("");
  }

  function makeOffer() {
    if (!active) return;
    const amount = window.prompt("Offer amount (₹)");
    const num = Number(amount);
    if (num > 0) sendOffer(active.id, num);
  }

  return (
    <div className="flex flex-1 lg:grid lg:grid-cols-[230px_1fr_210px] lg:gap-0 lg:border-t lg:border-border-hairline">
      {/* Conversation list */}
      <div className={cn("flex w-full flex-col border-r border-border-hairline lg:flex", activeId ? "hidden lg:flex" : "flex")}>
        <div className="flex items-center gap-3 border-b border-border-hairline px-4 py-3.5 lg:hidden">
          <h1 className="text-lg">Chats</h1>
        </div>
        <div className="p-3">
          <div className="flex h-10 items-center gap-2 rounded-full border border-border-input bg-surface px-3">
            <Search size={15} className="text-text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          {filteredList.map((c) => {
            const seller = getSeller(c.sellerId);
            const listing = getListing(c.listingId);
            return (
              <Link
                key={c.id}
                href={`/chats/${c.id}`}
                className={cn(
                  "flex items-center gap-3 border-l-2 px-4 py-3 hover:bg-surface",
                  c.id === activeId ? "border-accent bg-surface" : "border-transparent"
                )}
              >
                <Avatar name={seller?.name ?? "?"} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-[15px]">{seller?.name}</p>
                    <span className="label-mono shrink-0 text-[10px] text-text-faint">{c.updatedAt}</span>
                  </div>
                  <p className="truncate text-sm text-text-tertiary">{c.lastMessagePreview || listing?.title}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="label-mono flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] text-white">
                    {c.unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Thread pane */}
      <div className={cn("flex w-full flex-col", activeId ? "flex" : "hidden lg:flex")}>
        {!active ? (
          <EmptyState icon={MessageCircle} title="Select a conversation" description="Choose a chat from the list to see messages." />
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-border-hairline px-4 py-3">
              <button onClick={() => router.push("/chats")} className="text-text-secondary lg:hidden" aria-label="Back">
                <ChevronLeft size={20} />
              </button>
              <Avatar name={getSeller(active.sellerId)?.name ?? "?"} size={36} />
              <div>
                <p className="text-[15px]">{getSeller(active.sellerId)?.name}</p>
                {active.online && <p className="label-mono text-[10px] text-accent-text">ONLINE</p>}
              </div>
            </header>

            <Link
              href={`/listing/${active.listingId}`}
              className="mx-4 mt-3 flex items-center gap-3 rounded-[28px] bg-card shadow-soft p-2.5 lg:hidden"
            >
              <div className="img-placeholder h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{getListing(active.listingId)?.title}</p>
              </div>
              <p className="shrink-0 text-sm text-accent-text">₹{getListing(active.listingId)?.price}</p>
            </Link>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
              {active.messages.length === 0 && (
                <p className="py-8 text-center text-sm text-text-tertiary">Say hello and ask about the listing.</p>
              )}
              {active.messages.map((m) =>
                m.offerAmount ? (
                  <div key={m.id} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
                    <div className="w-56 rounded-[20px] bg-accent-tile p-3 shadow-soft">
                      <p className="label-mono text-[10px] text-text-label">OFFER</p>
                      <p className="my-1 text-xl font-medium text-accent">₹{m.offerAmount}</p>
                      {m.offerStatus === "pending" && m.from === "them" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => respondToOffer(active.id, m.id, "accepted")}
                            className="h-8 flex-1 rounded-full bg-accent text-xs text-white shadow-accent"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToOffer(active.id, m.id, "declined")}
                            className="h-8 flex-1 rounded-full border border-border-strong bg-white text-xs"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <p className="label-mono text-[10px] text-text-label">
                          {m.offerStatus === "pending" ? "AWAITING RESPONSE" : m.offerStatus?.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[15px]",
                        m.from === "me"
                          ? "rounded-br-md bg-accent text-white shadow-soft"
                          : "rounded-bl-md bg-card text-text-primary shadow-soft"
                      )}
                    >
                      {m.text}
                      <span className="label-mono ml-2 text-[9px] opacity-60">{m.sentAt}</span>
                    </div>
                  </div>
                )
              )}
            </div>

            <form onSubmit={submitMessage} className="flex items-center gap-2 border-t border-border-hairline p-3">
              <button type="button" onClick={makeOffer} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-tertiary" aria-label="Make an offer">
                <Paperclip size={18} />
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message..."
                className="h-10 flex-1 rounded-full border border-border-input bg-surface px-4 text-[15px] outline-none focus:border-accent"
              />
              <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white" aria-label="Send">
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>

      {/* Context pane (desktop) */}
      {active && (
        <div className="hidden flex-col gap-4 border-l border-border-hairline p-4 lg:flex">
          <ImagePlaceholder label="product shot" className="aspect-square w-full" />
          <div>
            <p className="text-[15px]">{getListing(active.listingId)?.title}</p>
            <p className="mt-1 text-lg text-accent-text">₹{getListing(active.listingId)?.price}</p>
          </div>
          <button onClick={() => router.push(`/listing/${active.listingId}`)} className="h-10 rounded-full bg-accent text-[15px] text-white shadow-accent hover:bg-accent-hover">
            Buy now
          </button>
          <button onClick={makeOffer} className="h-10 rounded-full border border-border-strong text-[15px]">
            Make offer
          </button>
          <p className="text-xs text-text-faint">
            Never pay outside Uni Mart. Payment stays in escrow until you confirm pickup.
          </p>
        </div>
      )}
    </div>
  );
}
