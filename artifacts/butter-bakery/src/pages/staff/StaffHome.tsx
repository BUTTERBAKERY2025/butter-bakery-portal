import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookOpen, FolderOpen, Layers, Link2, Plus, Printer, Users, Inbox } from "lucide-react";
import { api, fmtDate, type LogRow } from "./api";
import { useStaffText } from "./i18n";
import { StaffShell, canSeeGuide, useRequireMe } from "./StaffShell";

interface Summary {
  designs: Record<string, number>;
  activeLinks: number;
  proposals: { id: number; designId: number; author: string; createdAt: string; nameEn: string; nameAr: string }[];
  orders: { id: number; designId: number; printer: string; quantity: number; unit: string; status: string; dueDate: string | null; nameEn: string; nameAr: string }[];
  files: number;
  users: number;
  recent: LogRow[];
}

const STATUS_BAR: [string, string][] = [
  ["draft", "var(--bb-khaki)"],
  ["review", "var(--bb-caramel)"],
  ["approved", "var(--bb-olive)"],
  ["print", "var(--bb-orange)"],
];

function Tile({ href, icon, title, sub, dark = false }: { href: string; icon: React.ReactNode; title: string; sub: string; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`group relative p-5 md:p-6 flex flex-col justify-between min-h-[150px] transition-colors ${
        dark ? "bg-[var(--bb-brown)] text-[var(--bb-cream)] hover:bg-[#3a2b1d]" : "bb-card hover:border-[var(--bb-orange)]"
      }`}
    >
      <span className={dark ? "text-[var(--bb-orange)]" : "text-[var(--bb-orange)]"}>{icon}</span>
      <span>
        <span className="font-serif text-xl md:text-2xl block leading-tight">{title}</span>
        <span className={`text-xs mt-1 block ${dark ? "text-[var(--bb-cream)]/55" : "text-foreground/55"}`}>{sub}</span>
      </span>
      <ArrowUpRight className="absolute top-5 end-5 w-4 h-4 opacity-40 group-hover:opacity-100 rtl:-scale-x-100" />
    </Link>
  );
}

export default function StaffHome() {
  const { s, isAr } = useStaffText();
  const me = useRequireMe();
  const isAdmin = !!me.data?.user.isAdmin;
  const sum = useQuery({ queryKey: ["summary"], queryFn: () => api<Summary>("/admin/summary"), enabled: isAdmin, refetchInterval: 60_000 });

  if (!me.data) return <StaffShell>{null}</StaffShell>;
  const d = sum.data;
  const totalDesigns = d ? Object.values(d.designs).reduce((a, b) => a + b, 0) : 0;
  const hour = new Date().getHours();
  const greet = hour < 12 ? s.goodMorning : hour < 18 ? s.goodAfternoon : s.goodEvening;
  const name = (x: { nameEn: string; nameAr: string }) => (isAr ? x.nameAr : x.nameEn);

  return (
    <StaffShell me={me.data}>
      <section className="mb-10 md:mb-14">
        <p className="bb-eyebrow mb-3" dir="ltr">
          {new Date().toLocaleDateString(isAr ? "ar-EG-u-nu-latn" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="font-serif text-4xl md:text-6xl leading-[1.05]">
          {greet}
          {isAr ? "، " : ", "}
          {me.data.user.displayName}
        </h1>
      </section>

      {isAdmin && d && (
        <section className="grid grid-cols-3 lg:grid-cols-4 gap-px bg-border mb-10 border border-border">
          <div className="bg-card p-5 col-span-3 lg:col-span-1">
            <p className="text-xs text-foreground/55 mb-2">{s.designs}</p>
            <p className="font-serif text-4xl" dir="ltr">{totalDesigns}</p>
            <div className="flex h-1.5 mt-4 overflow-hidden rounded-full bg-muted">
              {STATUS_BAR.map(([k, c]) => (d.designs[k] ? <span key={k} style={{ width: `${(d.designs[k]! / Math.max(1, totalDesigns)) * 100}%`, background: c }} /> : null))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[0.68rem] text-foreground/60">
              {STATUS_BAR.map(([k, c]) => (
                <span key={k} className="inline-flex items-center gap-1">
                  <i className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />
                  {s.st[k]} <b dir="ltr">{d.designs[k] ?? 0}</b>
                </span>
              ))}
            </div>
          </div>
          {[
            [s.waitingApproval, d.proposals.length, <Inbox key="i" className="w-4 h-4" />],
            [s.atPrinter, d.orders.length, <Printer key="p" className="w-4 h-4" />],
            [s.activeLinksTitle, d.activeLinks, <Link2 key="l" className="w-4 h-4" />],
          ].map(([label, n, icon], i) => (
            <div key={i} className="bg-card p-4 md:p-5">
              <p className="text-[0.7rem] md:text-xs text-foreground/55 mb-2 flex items-center gap-1.5 md:gap-2">
                <span className="text-[var(--bb-orange)]">{icon}</span> {label}
              </p>
              <p className={`font-serif text-3xl md:text-4xl ${Number(n) > 0 && i === 0 ? "text-[var(--bb-orange)]" : ""}`} dir="ltr">
                {n as number}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {canSeeGuide(me.data) && <Tile href="/staff/guide" icon={<BookOpen className="w-6 h-6" />} title={s.guideTitle} sub={s.homeGuideSub} dark />}
        <Tile href="/staff/library" icon={<FolderOpen className="w-6 h-6" />} title={s.brandLibrary} sub={d ? `${d.files} ${s.files}` : s.homeLibrarySub} />
        {isAdmin && <Tile href="/staff/designs" icon={<Layers className="w-6 h-6" />} title={s.designOffice} sub={`${totalDesigns} ${s.designsCount}`} />}
        {isAdmin && <Tile href="/staff/designs?new=1" icon={<Plus className="w-6 h-6" />} title={s.newDesign} sub={s.newDesignSub} />}
        {isAdmin && <Tile href="/staff/admin" icon={<Users className="w-6 h-6" />} title={s.users} sub={d ? `${d.users} ${s.activeAccounts}` : ""} />}
      </section>

      {isAdmin && d && (
        <section className="grid lg:grid-cols-3 gap-8">
          <div>
            <h2 className="font-serif text-2xl mb-4">{s.needsDecision}</h2>
            {!d.proposals.length ? (
              <p className="text-sm text-foreground/50">{s.nothingWaiting}</p>
            ) : (
              <ul className="divide-y divide-border border-y border-border">
                {d.proposals.map((p) => (
                  <li key={p.id}>
                    <Link href={`/staff/designs?d=${p.designId}&tab=versions`} className="flex items-center justify-between gap-3 py-3 hover:text-primary">
                      <span>
                        <span className="block text-sm font-medium">{name(p)}</span>
                        <span className="block text-xs text-foreground/50" dir="ltr">
                          {p.author.replace(/^link:/, "")} · {fmtDate(p.createdAt)}
                        </span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 shrink-0 rtl:-scale-x-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="font-serif text-2xl mb-4">{s.atPrinter}</h2>
            {!d.orders.length ? (
              <p className="text-sm text-foreground/50">{s.noOrders}</p>
            ) : (
              <ul className="divide-y divide-border border-y border-border">
                {d.orders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/staff/designs?d=${o.designId}&tab=print`} className="block py-3 hover:text-primary">
                      <span className="flex justify-between gap-3 text-sm">
                        <span className="font-medium">{name(o)}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted shrink-0">{s.ps[o.status] ?? o.status}</span>
                      </span>
                      <span className="block text-xs text-foreground/50 mt-0.5" dir="ltr">
                        {o.printer} · {o.quantity} {o.unit}
                        {o.dueDate ? ` · ${o.dueDate}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="font-serif text-2xl mb-4">{s.recentActivity}</h2>
            <ul className="divide-y divide-border border-y border-border">
              {d.recent.map((r) => (
                <li key={r.id} className="py-2.5 text-xs flex justify-between gap-3">
                  <span>
                    <b className="font-medium" dir="ltr">
                      {r.username?.replace(/^link:/, "🔗 ") ?? "—"}
                    </b>{" "}
                    <span className="text-foreground/60">{s.actions[r.action] ?? r.action}</span>
                  </span>
                  <span className="text-foreground/40 shrink-0" dir="ltr">
                    {fmtDate(r.at)}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/staff/admin?tab=log" className="inline-block mt-3 text-xs text-primary hover:underline">
              {s.log} →
            </Link>
          </div>
        </section>
      )}
    </StaffShell>
  );
}
