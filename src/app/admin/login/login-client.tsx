"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        setLoading(false);
        return;
      }
      toast.success("Welcome back!");
      router.push(searchParams.get("next") ?? "/admin");
      router.refresh();
    } catch {
      toast.error("Network error");
      setLoading(false);
    }
  };

  return (
    <main className="relative flex-1 min-h-screen grid place-items-center px-4">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-violet-400/30 dark:bg-violet-600/20 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-fuchsia-400/25 dark:bg-fuchsia-600/20 blur-[130px]" />
      </div>
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <form onSubmit={submit} className="glass rounded-3xl p-8 w-full max-w-sm">
        <div className="mx-auto size-14 grid place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
          <Lock className="size-6 text-white" />
        </div>
        <h1 className="mt-5 text-center font-display text-2xl font-bold">Admin Login</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Enter the admin password to view submissions.
        </p>
        <div className="mt-6 space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            className="h-12"
          />
        </div>
        <Button type="submit" disabled={loading || !password} className="mt-5 w-full h-12">
          {loading ? "Checking..." : "Log in"}
        </Button>
        <Link href="/" className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground">
          ← Back to site
        </Link>
        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Built by <span className="font-semibold text-muted-foreground">Alite</span>
        </p>
      </form>
    </main>
  );
}
