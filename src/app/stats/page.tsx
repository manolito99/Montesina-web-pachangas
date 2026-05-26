"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

interface Stats {
  users: {
    total: number;
    active: number;
    newWeek: number;
    males: number;
    females: number;
    googleUsers: number;
    emailUsers: number;
    levels: { level: number; count: number }[];
    topPlayers: { name: string; level: number; count: number }[];
  };
  pachangas: {
    total: number;
    month: number;
    categories: { M: number; F: number; X: number };
    courts: { name: string; count: number }[];
    avgFillRate: number;
    completionRate: number;
    byDay: { day: string; count: number }[];
    byTimeSlot: { label: string; count: number }[];
  };
  trends: {
    weeks: { label: string; pachangas: number; participations: number }[];
  };
  push: { subscribers: number };
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/stats");
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/stats")
      .then((r) => {
        if (r.status === 403) { setError("Sin acceso"); return null; }
        return r.json();
      })
      .then((data) => { if (data && !data.error) setStats(data); })
      .catch(() => setError("Error cargando stats"));
  }, [status, router]);

  if (status === "loading" || (!stats && !error)) {
    return (
      <>
        <SiteHeader variant="paper" />
        <main className="flex min-h-screen items-center justify-center bg-paper">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-ink border-t-transparent" />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SiteHeader variant="paper" />
        <main className="flex min-h-screen items-center justify-center bg-paper">
          <p className="text-lg font-bold text-ink">{error}</p>
        </main>
      </>
    );
  }

  if (!stats) return null;

  const maxDay = Math.max(...stats.pachangas.byDay.map((d) => d.count), 1);
  const maxWeekP = Math.max(...stats.trends.weeks.map((w) => w.pachangas), 1);
  const maxWeekPart = Math.max(...stats.trends.weeks.map((w) => w.participations), 1);
  const maxLevel = Math.max(...stats.users.levels.map((l) => l.count), 1);

  return (
    <>
      <SiteHeader variant="paper" />
      <main className="min-h-screen bg-paper px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-extrabold text-ink">Panel de estadisticas</h1>
          <p className="mt-1 font-hand text-sm text-muted">Solo visible para administradores</p>

          {/* ── KPIs ── */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            <KpiCard label="Usuarios" value={stats.users.total} sub={`${stats.users.active} activos`} />
            <KpiCard label="Nuevos (7d)" value={stats.users.newWeek} />
            <KpiCard label="Pachangas" value={stats.pachangas.total} sub={`${stats.pachangas.month} este mes`} />
            <KpiCard label="Llenado medio" value={`${stats.pachangas.avgFillRate}%`} />
            <KpiCard label="Push subs" value={stats.push.subscribers} />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* ── Usuarios: Genero ── */}
            <Card title="Genero">
              <div className="flex items-center gap-6">
                <Donut
                  segments={[
                    { value: stats.users.males, color: "#3b82f6", label: "Hombres" },
                    { value: stats.users.females, color: "#ec4899", label: "Mujeres" },
                  ]}
                />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    Hombres: <strong>{stats.users.males}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-pink-500" />
                    Mujeres: <strong>{stats.users.females}</strong>
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Usuarios: Registro ── */}
            <Card title="Metodo de registro">
              <div className="flex items-center gap-6">
                <Donut
                  segments={[
                    { value: stats.users.googleUsers, color: "#c8e84a", label: "Google" },
                    { value: stats.users.emailUsers, color: "#0F1A2E", label: "Email" },
                  ]}
                />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-lime" />
                    Google: <strong>{stats.users.googleUsers}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-ink" />
                    Email: <strong>{stats.users.emailUsers}</strong>
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Usuarios: Nivel ── */}
            <Card title="Distribucion por nivel">
              <div className="space-y-2">
                {stats.users.levels.map((l) => (
                  <div key={l.level} className="flex items-center gap-2">
                    <span className="w-16 text-xs font-bold text-ink">Nivel {l.level}</span>
                    <div className="flex-1 rounded-full bg-fill-alt h-5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-lime"
                        style={{ width: `${(l.count / maxLevel) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-bold text-ink">{l.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Top jugadores ── */}
            <Card title="Top 5 jugadores">
              <div className="space-y-2">
                {stats.users.topPlayers.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ink bg-fill text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate text-sm font-semibold text-ink">{p.name}</span>
                    <span className="text-xs text-muted">Nv.{p.level}</span>
                    <span className="rounded-full bg-lime px-2 py-0.5 text-xs font-bold text-ink">
                      {p.count} partidos
                    </span>
                  </div>
                ))}
                {stats.users.topPlayers.length === 0 && (
                  <p className="font-hand text-xs text-muted">Sin datos aun</p>
                )}
              </div>
            </Card>

            {/* ── Pachangas: Categoria ── */}
            <Card title="Pachangas por categoria">
              <div className="flex items-center gap-6">
                <Donut
                  segments={[
                    { value: stats.pachangas.categories.M, color: "#3b82f6", label: "Masculino" },
                    { value: stats.pachangas.categories.F, color: "#ec4899", label: "Femenino" },
                    { value: stats.pachangas.categories.X, color: "#c8e84a", label: "Mixto" },
                  ]}
                />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    Masculino: <strong>{stats.pachangas.categories.M}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-pink-500" />
                    Femenino: <strong>{stats.pachangas.categories.F}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-lime" />
                    Mixto: <strong>{stats.pachangas.categories.X}</strong>
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Pachangas: Pistas ── */}
            <Card title="Pistas mas usadas">
              <div className="space-y-2">
                {stats.pachangas.courts.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 text-sm font-semibold text-ink">{c.name}</span>
                    <span className="rounded-full bg-fill-alt px-2 py-0.5 text-xs font-bold text-ink">
                      {c.count} pachangas
                    </span>
                  </div>
                ))}
                {stats.pachangas.courts.length === 0 && (
                  <p className="font-hand text-xs text-muted">Sin datos aun</p>
                )}
              </div>
            </Card>

            {/* ── Dia de la semana ── */}
            <Card title="Dia de la semana">
              <div className="flex items-end gap-1 h-32">
                {stats.pachangas.byDay.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-lime transition-all"
                      style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                    />
                    <span className="text-[10px] font-bold text-ink">{d.day}</span>
                    <span className="text-[10px] text-muted">{d.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Franja horaria ── */}
            <Card title="Franja horaria">
              <div className="space-y-2">
                {stats.pachangas.byTimeSlot.map((s) => {
                  const maxSlot = Math.max(...stats.pachangas.byTimeSlot.map((t) => t.count), 1);
                  return (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="w-28 text-xs font-semibold text-ink">{s.label}</span>
                      <div className="flex-1 rounded-full bg-fill-alt h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-lime"
                          style={{ width: `${(s.count / maxSlot) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-xs font-bold text-ink">{s.count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* ── Completado + Llenado ── */}
            <Card title="Rendimiento">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-lime-deep">{stats.pachangas.avgFillRate}%</div>
                  <div className="text-xs text-muted">Llenado medio</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-lime-deep">{stats.pachangas.completionRate}%</div>
                  <div className="text-xs text-muted">Completadas (4/4)</div>
                </div>
              </div>
            </Card>

            {/* ── Tendencia: Pachangas por semana ── */}
            <Card title="Pachangas por semana" wide>
              <div className="flex items-end gap-2 h-32">
                {stats.trends.weeks.map((w) => (
                  <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-lime transition-all"
                      style={{ height: `${(w.pachangas / maxWeekP) * 100}%`, minHeight: w.pachangas > 0 ? "4px" : "0" }}
                    />
                    <span className="text-[9px] font-bold text-ink">{w.label}</span>
                    <span className="text-[9px] text-muted">{w.pachangas}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Tendencia: Participaciones por semana ── */}
            <Card title="Participaciones por semana" wide>
              <div className="flex items-end gap-2 h-32">
                {stats.trends.weeks.map((w) => (
                  <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-blue-500 transition-all"
                      style={{ height: `${(w.participations / maxWeekPart) * 100}%`, minHeight: w.participations > 0 ? "4px" : "0" }}
                    />
                    <span className="text-[9px] font-bold text-ink">{w.label}</span>
                    <span className="text-[9px] text-muted">{w.participations}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border-[1.5px] border-ink bg-fill p-3 text-center">
      <div className="text-2xl font-extrabold text-ink">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">{label}</div>
      {sub && <div className="mt-0.5 font-hand text-xs text-muted">{sub}</div>}
    </div>
  );
}

function Card({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("rounded-lg border-[1.5px] border-ink bg-fill p-4", wide && "md:col-span-2")}>
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Donut({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) {
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-fill-alt">
        <span className="text-xs text-muted">0</span>
      </div>
    );
  }

  let cumulative = 0;
  const gradientParts = segments.map((s) => {
    const start = (cumulative / total) * 360;
    cumulative += s.value;
    const end = (cumulative / total) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  });

  return (
    <div
      className="h-20 w-20 shrink-0 rounded-full"
      style={{ background: `conic-gradient(${gradientParts.join(", ")})` }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fill">
          <span className="text-sm font-extrabold text-ink">{total}</span>
        </div>
      </div>
    </div>
  );
}
