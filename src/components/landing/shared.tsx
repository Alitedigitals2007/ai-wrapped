"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { APP_NAME } from "@/lib/brand";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#how", label: "How it works" },
    { href: "#features", label: "Features" },
    { href: "#faq", label: "FAQ" },
    { href: "/compare", label: "Compare" },
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-4 glass rounded-full px-5 py-3 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight shrink-0">
            <span className="grid place-items-center size-8 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-white text-base">
              🧠
            </span>
            {APP_NAME}
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <Link
              href="/personality"
              className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold px-4 py-2 transition-all hover:shadow-lg hover:shadow-fuchsia-500/25"
            >
              Test my personality
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="md:hidden grid place-items-center size-9 rounded-full border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="md:hidden mt-2 glass rounded-3xl p-3 flex flex-col gap-1 text-muted-foreground"
            >
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/personality"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-center text-sm font-semibold px-4 py-3 hover:from-violet-500 hover:to-fuchsia-500 transition-colors"
              >
                Test my personality ✨
              </Link>
              <Link
                href="/generate"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-black/10 dark:border-white/10 px-4 py-3 text-sm font-medium text-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Generate an AI Wrap 🤖
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute -top-32 -left-32 size-[28rem] rounded-full bg-violet-400/35 dark:bg-violet-600/25 blur-[120px] animate-float-slow" />
      <div className="absolute top-1/3 -right-40 size-[26rem] rounded-full bg-fuchsia-400/30 dark:bg-fuchsia-600/20 blur-[120px] animate-float-slower" />
      <div className="absolute bottom-0 left-1/4 size-[24rem] rounded-full bg-cyan-400/25 dark:bg-cyan-500/15 blur-[120px] animate-float-slow" />
      <div className="absolute inset-0 bg-dots opacity-[0.15] dark:opacity-100" style={{ backgroundSize: "36px 36px" }} />
    </div>
  );
}
