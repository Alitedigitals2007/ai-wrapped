"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AI_OPTIONS, AI_EMOJI } from "@/lib/analysis/prompt";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Search, Download, Eye, Trash2, LogOut, Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "wraps" | "tests";

interface WrapRow {
  id: string;
  username: string;
  aiUsed: string;
  createdAt: string;
  overallScore: number;
  personalityType: string;
}

interface TestRow {
  id: string;
  name: string;
  createdAt: string;
  code: string | null;
  engine: string | null;
  label: string;
  archetype: string;
  overallScore: number;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
        score >= 75
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : score >= 55
            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
            : "bg-black/5 text-muted-foreground dark:bg-white/10"
      )}
    >
      {score}
    </span>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("wraps");
  const [rows, setRows] = useState<WrapRow[]>([]);
  const [testRows, setTestRows] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [ai, setAi] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [toDelete, setToDelete] = useState<WrapRow | TestRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        if (tab === "wraps") {
          const params = new URLSearchParams();
          if (search) params.set("search", search);
          if (ai !== "all") params.set("ai", ai);
          if (from) params.set("from", from);
          if (to) params.set("to", to);
          if (sort !== "newest") params.set("sort", sort);
          const res = await fetch(`/api/submissions?${params.toString()}`);
          if (res.status === 401) {
            router.push("/admin/login");
            return;
          }
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to load");
          if (!cancelled) setRows(data.rows ?? []);
        } else {
          const params = new URLSearchParams();
          if (search) params.set("search", search);
          if (from) params.set("from", from);
          if (to) params.set("to", to);
          if (sort !== "newest") params.set("sort", sort);
          const res = await fetch(`/api/assessments?${params.toString()}`);
          if (res.status === 401) {
            router.push("/admin/login");
            return;
          }
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to load");
          if (!cancelled) setTestRows(data.rows ?? []);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [tab, search, ai, from, to, sort, router]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const kind = tab;
      const res = await fetch(`/api/${kind === "wraps" ? "submissions" : "assessments"}/${toDelete.id}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`Deleted ${"username" in toDelete ? toDelete.username : toDelete.name}'s record`);
      if (kind === "wraps") setRows((r) => r.filter((x) => x.id !== toDelete.id));
      else setTestRows((r) => r.filter((x) => x.id !== toDelete.id));
      setToDelete(null);
    } catch {
      toast.error("Could not delete record");
    } finally {
      setDeleting(false);
    }
  };

  const exportCsv = () => {
    if (tab === "wraps") {
      if (rows.length === 0) {
        toast.error("Nothing to export");
        return;
      }
      const header = ["Username", "AI Used", "Date", "Overall Score", "Personality Type", "Link"];
      const lines = rows.map((r) =>
        [
          `"${r.username.replace(/"/g, '""')}"`,
          `"${r.aiUsed}"`,
          fmtDate(r.createdAt),
          r.overallScore,
          `"${r.personalityType.replace(/"/g, '""')}"`,
          `${window.location.origin}/wrapped/${r.id}`,
        ].join(",")
      );
      const csv = [header.join(","), ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-wrapped-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
      return;
    }

    if (testRows.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const header = ["Name", "Date", "Code", "Archetype", "Label", "Average Dimension Score", "Link"];
    const lines = testRows.map((r) =>
      [
        `"${r.name.replace(/"/g, '""')}"`,
        fmtDate(r.createdAt),
        `"${r.code ?? ""}"`,
        `"${r.archetype.replace(/"/g, '""')}"`,
        `"${r.label.replace(/"/g, '""')}"`,
        r.overallScore,
        `${window.location.origin}/report/${r.code}`,
      ].join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `personality-tests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const total = tab === "wraps" ? rows.length : testRows.length;
  const avgScore = useMemo(() => {
    if (tab === "wraps")
      return total ? Math.round(rows.reduce((s, r) => s + r.overallScore, 0) / total) : 0;
    return total ? Math.round(testRows.reduce((s, r) => s + r.overallScore, 0) / total) : 0;
  }, [tab, rows, testRows, total]);

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-8 pb-16">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 right-0 size-96 rounded-full bg-violet-400/30 dark:bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-0 size-96 rounded-full bg-fuchsia-400/25 dark:bg-fuchsia-600/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              📊 Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} {tab === "wraps" ? "submission" : "test"}
              {total === 1 ? "" : "s"} · average score {avgScore}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Button variant="outline" onClick={exportCsv}>
              <Download className="mr-2 size-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 size-4" /> Log out
            </Button>
          </div>
        </div>

        <div className="glass rounded-3xl p-1.5 grid grid-cols-2 gap-1 max-w-sm">
          <button
            onClick={() => {
              setTab("wraps");
              setSearch("");
            }}
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === "wraps"
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            🪄 AI Wraps
          </button>
          <button
            onClick={() => {
              setTab("tests");
              setSearch("");
            }}
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === "tests"
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            🧠 Personality Tests
          </button>
        </div>

        <div className="glass rounded-3xl p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={tab === "wraps" ? "Search by username..." : "Search by name..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {tab === "wraps" ? (
            <Select value={ai} onValueChange={(v) => setAi(v ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder="All AIs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All AIs</SelectItem>
                {AI_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.emoji} {o.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="hidden lg:block" />
          )}
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
        </div>

        <div className="glass rounded-3xl overflow-hidden">
          {tab === "wraps" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>AI Used</TableHead>
                  <TableHead>
                    <button
                      onClick={() => setSort(sort === "score" ? "newest" : "score")}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Score
                      <span className="text-[10px]">{sort === "score" ? "↑" : ""}</span>
                    </button>
                  </TableHead>
                  <TableHead>Personality</TableHead>
                  <TableHead>
                    <button
                      onClick={() => setSort(sort === "oldest" ? "newest" : "oldest")}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Date
                      <span className="text-[10px]">{sort === "oldest" ? "↑" : ""}</span>
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="mx-auto size-6 animate-spin" />
                      Loading submissions...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-destructive">{error}</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <Inbox className="mx-auto size-8 mb-2 opacity-50" />
                      No submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id} className="group">
                      <TableCell className="font-semibold">{r.username}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          {AI_EMOJI[r.aiUsed] ?? "🤖"} {r.aiUsed}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ScoreBadge score={r.overallScore} />
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[180px] truncate" title={r.personalityType}>
                        {r.personalityType}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{fmtDate(r.createdAt)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          Completed
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" render={<Link href={`/admin/${r.id}`} />}>
                            <Eye className="mr-1.5 size-4" /> View
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setToDelete(r)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Archetype</TableHead>
                  <TableHead>
                    <button
                      onClick={() => setSort(sort === "score" ? "newest" : "score")}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Avg Dimension Score
                      <span className="text-[10px]">{sort === "score" ? "↑" : ""}</span>
                    </button>
                  </TableHead>
                  <TableHead>Engine</TableHead>
                  <TableHead>
                    <button
                      onClick={() => setSort(sort === "oldest" ? "newest" : "oldest")}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Date
                      <span className="text-[10px]">{sort === "oldest" ? "↑" : ""}</span>
                    </button>
                  </TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="mx-auto size-6 animate-spin" />
                      Loading personality tests...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-destructive">{error}</TableCell>
                  </TableRow>
                ) : testRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <Inbox className="mx-auto size-8 mb-2 opacity-50" />
                      No personality tests found
                    </TableCell>
                  </TableRow>
                ) : (
                  testRows.map((r) => (
                    <TableRow key={r.id} className="group">
                      <TableCell className="font-semibold">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[180px] truncate" title={r.archetype}>
                        {r.archetype}
                      </TableCell>
                      <TableCell>
                        <ScoreBadge score={r.overallScore} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            r.engine === "groq"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              : r.engine === "openai"
                                ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                                : "bg-black/5 text-muted-foreground dark:bg-white/10"
                          )}
                        >
                          {r.engine === "groq" ? "⚡ Groq" : r.engine === "openai" ? "✦ OpenAI" : "⚙️ Local"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{fmtDate(r.createdAt)}</TableCell>
                      <TableCell className="font-mono font-bold">{r.code ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" render={<Link href={`/admin/test/${r.id}`} />}>
                            <Eye className="mr-1.5 size-4" /> View
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setToDelete(r)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/60 pt-4">
          Built by <span className="font-semibold text-muted-foreground">Alite</span> · Aura Admin
        </p>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tab === "wraps" ? "Delete submission?" : "Delete test?"}</DialogTitle>
            <DialogDescription>
              This permanently deletes{" "}
              <span className="font-semibold text-foreground">
                {toDelete ? ("username" in toDelete ? toDelete.username : toDelete.name) : ""}
              </span>
              &apos;s {tab === "wraps" ? "wrapped" : "personality"} record. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}