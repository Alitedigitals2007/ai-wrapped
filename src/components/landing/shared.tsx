import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-4 glass rounded-full px-5 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
            <span className="grid place-items-center size-8 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-white text-base">
              🪄
            </span>
            AI Wrapped
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/generate"
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold px-4 py-2 transition-all hover:shadow-lg hover:shadow-fuchsia-500/25"
            >
              Generate My Wrapped
            </Link>
          </div>
        </div>
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
