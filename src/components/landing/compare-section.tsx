"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Swords } from "lucide-react";
import { Reveal } from "./shared";

export function CompareSection() {
  const router = useRouter();
  const [me, setMe] = useState("");
  const [them, setThem] = useState("");

  const battle = () => {
    const m = me.trim().toUpperCase();
    const t = them.trim().toUpperCase();
    if (m.length < 4 || t.length < 4) {
      toast.error("Enter both codes first.");
      return;
    }
    router.push(`/compare?me=${encodeURIComponent(m)}&them=${encodeURIComponent(t)}`);
  };

  return (
    <section className="px-4 py-24 scroll-mt-24">
      <Reveal className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-[2.5rem] glass px-6 py-14 md:px-12 text-center">
          <div
            aria-hidden
            className="absolute -top-24 right-1/4 size-72 rounded-full bg-violet-400/40 dark:bg-violet-600/25 blur-[100px]"
          />
          <h2 className="relative font-display text-3xl md:text-5xl font-bold tracking-tight">
            Battle two <span className="text-gradient">Wraps</span> 🥊
          </h2>
          <p className="relative mt-4 text-muted-foreground max-w-md mx-auto">
            Got a friend&apos;s code? Drop your code and theirs below and see who
            has the higher AI Power Level.
          </p>

          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Input
              value={me}
              onChange={(e) => setMe(e.target.value.toUpperCase())}
              placeholder="Your code"
              maxLength={6}
              className="h-14 w-40 text-center font-mono uppercase tracking-[0.2em] text-lg"
            />
            <span className="font-display font-bold text-2xl text-muted-foreground">VS</span>
            <Input
              value={them}
              onChange={(e) => setThem(e.target.value.toUpperCase())}
              placeholder="Friend's code"
              maxLength={6}
              className="h-14 w-40 text-center font-mono uppercase tracking-[0.2em] text-lg"
            />
            <Button
              onClick={battle}
              className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500"
            >
              <Swords className="mr-1.5 size-5" /> Battle
            </Button>
          </div>

          <p className="relative mt-6 text-xs text-muted-foreground/80">
            Find codes on any share card — every Wrapped has one. No account needed.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
