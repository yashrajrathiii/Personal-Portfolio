import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import api from "@/lib/api";
import { BarChart3, Users, Eye, Globe, RefreshCw } from "lucide-react";

function formatTs(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function shortRef(ref) {
  if (!ref) return "Direct";
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return ref.slice(0, 30);
  }
}

function shortUa(ua) {
  if (!ua) return "—";
  if (/Mobile|Android|iPhone/i.test(ua)) return "Mobile";
  const m = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
  return m ? m[1] : ua.split(" ").pop().slice(0, 16);
}

export default function AnalyticsDialog({ open, onOpenChange }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/analytics/stats");
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const maxDaily = stats?.daily?.length ? Math.max(1, ...stats.daily.map((d) => d.count)) : 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="analytics-dialog"
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-none border-2 border-[#0A0A0A] bg-white"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-klein">Edit Mode · Analytics</span>
              <DialogTitle className="font-display font-black uppercase text-3xl tracking-tightest leading-none mt-1">
                Recruiter Pulse
              </DialogTitle>
              <DialogDescription className="text-neutral-500">
                Who's looking at your portfolio, when, and from where.
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              data-testid="analytics-refresh"
              className="p-2 border border-black/15 hover:border-klein hover:text-klein"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </DialogHeader>

        {!stats && loading && (
          <div className="py-16 text-center font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-400">
            Loading analytics…
          </div>
        )}

        {stats && (
          <div className="space-y-8 mt-4">
            {/* KPI tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/10 border border-black/10">
              {[
                { label: "Total Visits", value: stats.total, Icon: Eye },
                { label: "Last 24h", value: stats.last_day, Icon: BarChart3 },
                { label: "Last 7 days", value: stats.last_week, Icon: BarChart3 },
                { label: "Unique Visitors", value: stats.unique_visitors, Icon: Users },
              ].map((k) => (
                <div key={k.label} data-testid={`stat-${k.label.toLowerCase().replace(/\s+/g, "-")}`} className="bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">{k.label}</span>
                    <k.Icon className="w-3.5 h-3.5 text-klein" />
                  </div>
                  <div className="mt-3 font-display font-black text-4xl tracking-tightest leading-none">{k.value}</div>
                </div>
              ))}
            </div>

            {/* Daily bar chart */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500">
                  Last 14 days
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-400">
                  {stats.daily.length} active days
                </span>
              </div>
              {stats.daily.length === 0 ? (
                <div className="border border-dashed border-black/15 p-8 text-center font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-400">
                  No visits yet
                </div>
              ) : (
                <div className="flex items-end gap-1 h-32 border-b border-black/10 pb-1">
                  {stats.daily.map((d) => (
                    <div key={d.day} className="flex-1 group relative flex flex-col justify-end">
                      <div
                        className="w-full bg-klein/80 hover:bg-klein transition-colors"
                        style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: "2px" }}
                        title={`${d.day} · ${d.count} visits`}
                      />
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 font-mono text-[9px] tracking-wider text-klein whitespace-nowrap">
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top referrers */}
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500">
                Top Referrers
              </span>
              {stats.top_referrers.length === 0 ? (
                <div className="mt-3 border border-dashed border-black/15 p-4 font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-400">
                  Mostly direct traffic
                </div>
              ) : (
                <div className="mt-3 space-y-1">
                  {stats.top_referrers.map((r) => (
                    <div key={r.referrer} className="flex items-center gap-3 py-1.5 border-b border-black/5">
                      <Globe className="w-3.5 h-3.5 text-klein shrink-0" />
                      <span className="flex-1 truncate text-sm">{shortRef(r.referrer)}</span>
                      <span className="font-mono text-xs text-neutral-500">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent visits */}
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500">
                Recent Visits
              </span>
              <div className="mt-3 border border-black/10">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-neutral-50 border-b border-black/10 font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-500">
                  <div className="col-span-3">Time</div>
                  <div className="col-span-5">Referrer</div>
                  <div className="col-span-2">Browser</div>
                  <div className="col-span-2">Lang</div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {stats.recent.length === 0 ? (
                    <div className="px-3 py-6 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-400">
                      No visits yet — share your link.
                    </div>
                  ) : (
                    stats.recent.map((v) => (
                      <div key={v.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-black/5 text-xs">
                        <div className="col-span-3 font-mono text-neutral-600">{formatTs(v.ts)}</div>
                        <div className="col-span-5 truncate text-neutral-700">{shortRef(v.referrer)}</div>
                        <div className="col-span-2 font-mono text-neutral-500">{shortUa(v.user_agent)}</div>
                        <div className="col-span-2 font-mono text-neutral-500 uppercase">{(v.language || "—").slice(0, 5)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
