import { Suspense } from "react";
import CompareClient from "./compare-client";

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>}>
      <CompareClient />
    </Suspense>
  );
}