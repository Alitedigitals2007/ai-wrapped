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
import { Search, Download, Eye, Trash2, LogOut, Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface Row {
  id: string;
  username: string;
  aiUsed: string;
  createdAt: string;
  overallScore: number;
  personalityType: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [ai, setAi] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
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
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load submissions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [search, ai, from, to, sort, router]);

  const onSearchChange = (v: string) => {
    setSearch(v);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/submissions/${toDelete.id}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`Deleted ${toDelete.username}'s submission`);
      setRows((r) => r.filter((x) => x.id !== toDelete.id));
      setToDelete(null);
    } catch {
      toast.error("Could not delete submission");
    } finally {
      setDeleting(false);
    }
  };

  const exportCsv = () => {
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
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const total = rows.length;
  const avgScore = useMemo(
    () => (total ? Math.round(rows.reduce((s, r) => s + r.overallScore, 0) / total) : 0),
    [rows, total]
  );

  return (
    <main className="relative flex-1 min-h-screen px-4 pt-8 pb-16">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 right-0 size-96 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-0 size-96 rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              📊 Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} submission{total === 1 ? "" : "s"} · average score {avgScore}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}>
              <Download className="mr-2 size-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 size-4" /> Log out
            </Button>
          </div>
        </div>

        <div className="glass rounded-3xl p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
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
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
        </div>

        <div className="glass rounded-3xl overflow-hidden">
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
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
                          r.overallScore >= 75
                            ? "bg-emerald-500/15 text-emerald-300"
                            : r.overallScore >= 55
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-white/10 text-muted-foreground"
                        )}
                      >
                        {r.overallScore}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[180px] truncate" title={r.personalityType}>
                      {r.personalityType}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{fmtDate(r.createdAt)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
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
        </div>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete submission?</DialogTitle>
            <DialogDescription>
              This permanently deletes <span className="font-semibold text-foreground">{toDelete?.username}</span>
              &apos;s submission ({toDelete?.aiUsed}). This cannot be undone.
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
