"use client";

import { AuthGate } from "@/components/AuthGate";
import { ChatsView } from "@/components/chat/ChatsView";

export default function ChatsPage() {
  return (
    <AuthGate>
      <ChatsView />
    </AuthGate>
  );
}
