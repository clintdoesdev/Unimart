"use client";

import { useParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { ChatsView } from "@/components/chat/ChatsView";

export default function ChatThreadPage() {
  const params = useParams<{ id: string }>();
  return (
    <AuthGate>
      <ChatsView activeId={params.id} />
    </AuthGate>
  );
}
