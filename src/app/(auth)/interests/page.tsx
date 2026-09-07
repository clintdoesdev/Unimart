import { Suspense } from "react";
import { InterestsClient } from "./InterestsClient";

export default function InterestsPage() {
  return (
    <Suspense fallback={null}>
      <InterestsClient />
    </Suspense>
  );
}
