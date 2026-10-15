import { lazy, Suspense, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Copy, Download, ExternalLink, Link2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError, fmtDate } from "./api";
import { useStaffText } from "./i18n";
import type { Model3D } from "./Design3D";

const Design3D = lazy(() => import("./Design3D").then((m) => ({ default: m.Design3D })));

type StoredModel =
  | { type: "cup"; oz: string; colour: string; texture: string }
  | { type: "box"; L: number; W: number; H: number; color: string; logoColor: string; logo: string }
  | { type: "flat"; w: number; h: number; d?: number; front: string; back?: string; standing?: boolean }
  | { type: "card"; w: number; h: number; bg: string; logo: string; logoColor: string; backBg: string; symbol: string; symbolColor: string };

export interface DesignRow {
  id: number;
  slug: string;
  category: string;
  nameEn: string;
  nameAr: string;
  status: string;
  specs: { size?: string; material?: string; colours?: string[]; use?: string; useAr?: string; notes?: string };
  model: StoredModel | null;
  images: string[];
  files: string[];
  activeShares: number;
  missing: string[];
}
interface ShareRow {
  id: number;
  recipient: string;
  note: string | null;
  expiresAt: string;
  maxViews: number;
  views: number;
  failedPins: number;
  revokedAt: string | null;
  revokedReason: string | null;
  createdAt: string;
  lastOpenedAt: string | null;
  opens: { at: string; ip: string | null }[];
}

export const asset = (p: string, dl = false) => `/api/staff/asset?path=${encodeURIComponent(p)}${dl ? "&dl=1" : ""}`;

/** The stored model points at brand file paths; the viewer needs URLs. */
export function toViewer(m: StoredModel, url: (p: string) => string): Model3D {
  if (m.type === "cup") return { ...m, texture: url(m.texture) };
  if (m.type === "box") return { ...m, logo: url(m.logo) };
  if (m.type === "card") return { ...m, logo: url(m.logo), symbol: url(m.symbol) };
  return { ...m, front: url(m.front), back: m.back ? url(m.back) : undefined };
}

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-muted text-foreground/70 border-border",
  review: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  print: "bg-sky-50 text-sky-800 border-sky-200",
};
const CATS = ["all", "cups", "boxes", "paper", "signage", "cards", "uniform", "bags", "social", "menu"];

function cover(d: DesignRow): string | null {
  if (d.images[0]) return d.images[0];
  if (d.model?.type === "flat") return d.model.front;
  if (d.model?.type === "cup") return d.model.texture;
  return null;
}

function shareState(s: ShareRow): string {
  if (s.revokedAt) return s.revokedReason === "too_many_wrong_pins" ? "too_many_wrong_pins" : "revoked";
  if (new Date(s.expiresAt).getTime() <= Date.now()) return "expired";
  if (s.views >= s.maxViews) return "used_up";
  return "active";
}

export function StaffDesigns() {
  const { s, isAr } = useStaffText();
  const [cat, setCat] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const q = useQuery({ queryKey: ["designs"], queryFn: () => api<{ designs: DesignRow[] }>("/admin/designs") });
  const designs = q.data?.designs ?? [];
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: designs.length };
    for (const d of designs) c[d.category] = (c[d.category] ?? 0) + 1;
    return c;
  }, [designs]);
  const open = designs.find((d) => d.id === openId);

  if (open) return <DesignDetail d={open} onBack={() => setOpenId(null)} />;

  const list = designs.filter((d) => cat === "all" || d.category === cat);
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATS.filter((c) => c === "all" || counts[c]).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`text-xs px-3 py-1.5 border ${cat === c ? "border-primary text-primary" : "border-border text-foreground/60 hover:border-primary"}`}
          >
            {s.cat[c] ?? c} <span className="text-foreground/40" dir="ltr">· {counts[c] ?? 0}</span>
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {list.map((d) => {
          const c = cover(d);
          return (
            <li key={d.id}>
              <button onClick={() => setOpenId(d.id)} className="w-full text-start border border-border/70 bg-card hover:border-primary transition-colors flex flex-col">
                <div className="aspect-[4/3] bg-muted/40 overflow-hidden flex items-center justify-center">
                  {c ? (
                    <img src={asset(c)} alt="" loading="lazy" className="w-full h-full object-cover" />
                  ) : d.model?.type === "box" ? (
                    <span className="w-2/3 h-1/2 rounded-sm" style={{ background: d.model.color }} />
                  ) : d.model?.type === "card" ? (
                    <span className="w-1/2 aspect-[9/5] rounded-sm shadow" style={{ background: d.model.bg }} />
                  ) : null}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-sm font-medium leading-snug">{isAr ? d.nameAr : d.nameEn}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[0.65rem] px-2 py-0.5 border rounded-full ${STATUS_STYLE[d.status] ?? STATUS_STYLE.draft}`}>{s.st[d.status] ?? d.status}</span>
                    {d.activeShares > 0 && (
                      <span className="text-[0.65rem] px-2 py-0.5 border border-primary/40 text-primary rounded-full inline-flex items-center gap-1">
                        <Link2 className="w-3 h-3" /> <span dir="ltr">{d.activeShares}</span>
                      </span>
                    )}
                    {d.missing.length > 0 && <span className="text-[0.65rem] px-2 py-0.5 border border-red-200 text-red-700 rounded-full">{s.missingFiles}</span>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CopyBtn({ value, label, done }: { value: string; label: string; done: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setOk(true);
          setTimeout(() => setOk(false), 1800);
        } catch {
          /* clipboard blocked; the value is visible to select */
        }
      }}
      className="inline-flex items-center gap-1.5 text-xs border border-border px-3 py-2 hover:border-primary hover:text-primary shrink-0"
    >
      <Copy className="w-3.5 h-3.5" /> {ok ? done : label}
    </button>
  );
}

function DesignDetail({ d, onBack }: { d: DesignRow; onBack: () => void }) {
  const { s, isAr } = useStaffText();
  const qc = useQueryClient();
  const [notes, setNotes] = useState(d.specs.notes ?? "");
  const [recipient, setRecipient] = useState("");
  const [hours, setHours] = useState("72");
  const [maxViews, setMaxViews] = useState("10");
  const [made, setMade] = useState<{ url: string; pin: string } | null>(null);
  const [err, setErr] = useState("");

  const shares = useQuery({ queryKey: ["shares", d.id], queryFn: () => api<{ shares: ShareRow[] }>(`/admin/designs/${d.id}/shares`) });
  const patch = useMutation({
    mutationFn: (body: Record<string, unknown>) => api(`/admin/designs/${d.id}`, { method: "PATCH", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["designs"] }),
  });
  const create = useMutation({
    mutationFn: () =>
      api<{ path: string; pin: string }>(`/admin/designs/${d.id}/shares`, {
        method: "POST",
        body: { recipient, hours: Number(hours), maxViews: Number(maxViews) },
      }),
    onSuccess: (r) => {
      setMade({ url: window.location.origin + r.path, pin: r.pin });
      setRecipient("");
      setErr("");
      qc.invalidateQueries({ queryKey: ["shares", d.id] });
      qc.invalidateQueries({ queryKey: ["designs"] });
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : String(e)),
  });
  const revoke = useMutation({
    mutationFn: (sid: number) => api(`/admin/shares/${sid}/revoke`, { method: "POST", body: {} }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shares", d.id] });
      qc.invalidateQueries({ queryKey: ["designs"] });
    },
  });

  const Back = isAr ? ArrowRight : ArrowLeft;
  const spec: [string, string | undefined][] = [
    [s.sizeL, d.specs.size],
    [s.materialL, d.specs.material],
    [s.coloursL, d.specs.colours?.join(" · ")],
    [s.useL, isAr ? d.specs.useAr ?? d.specs.use : d.specs.use],
  ];

  return (
    <div className="space-y-8">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary">
        <Back className="w-4 h-4" /> {s.backToDesigns}
      </button>

      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-8">
        <div className="border border-border/60 bg-[#f6efe2] h-[420px] md:h-[520px]">
          {d.model ? (
            <Suspense fallback={null}>
              <Design3D model={toViewer(d.model, (p) => asset(p))} text={s.d3} className="w-full h-full" />
            </Suspense>
          ) : (
            d.images[0] && <img src={asset(d.images[0])} alt="" className="w-full h-full object-contain" />
          )}
        </div>

        <div className="space-y-6 min-w-0">
          <div>
            <p className="text-xs text-primary uppercase tracking-[0.25em] mb-2">{s.cat[d.category] ?? d.category}</p>
            <h2 className="font-serif text-2xl md:text-3xl">{isAr ? d.nameAr : d.nameEn}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["draft", "review", "approved", "print"].map((st) => (
              <button
                key={st}
                onClick={() => patch.mutate({ status: st })}
                className={`text-xs px-3 py-1.5 border ${d.status === st ? STATUS_STYLE[st] + " font-medium" : "border-border text-foreground/50 hover:border-primary"}`}
              >
                {s.st[st]}
              </button>
            ))}
          </div>
          <dl className="divide-y divide-border/60 border-y border-border/60 text-sm">
            {spec
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex gap-4 py-2.5">
                  <dt className="w-24 shrink-0 text-foreground/50">{k}</dt>
                  <dd className="min-w-0">{v}</dd>
                </div>
              ))}
          </dl>
          <div className="space-y-2">
            <Label>{s.notesL}</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-input bg-background px-3 py-2 text-sm" />
            <Button size="sm" variant="outline" onClick={() => patch.mutate({ notes })} disabled={patch.isPending || notes === (d.specs.notes ?? "")}>
              {s.saveNotes}
            </Button>
          </div>
          {d.files.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">{s.printFiles}</p>
              <ul className="space-y-1.5">
                {d.files.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-xs">
                    <span className="flex-1 break-all" dir="ltr">{f.split("/").pop()}</span>
                    <a href={asset(f)} target="_blank" rel="noopener" className="text-foreground/60 hover:text-primary inline-flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" /> {s.view}
                    </a>
                    <a href={asset(f, true)} className="text-primary inline-flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> {s.download}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {d.missing.length > 0 && (
            <p className="text-xs text-red-700" dir="ltr">
              {s.missingFiles}: {d.missing.join(", ")}
            </p>
          )}
        </div>
      </div>

      {d.images.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3">{s.gallery}</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {d.images.map((p) => (
              <a key={p} href={asset(p)} target="_blank" rel="noopener" className="shrink-0 w-44 aspect-[4/3] border border-border/60 bg-muted/30 overflow-hidden">
                <img src={asset(p)} alt="" loading="lazy" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ---------- protected share links ---------- */}
      <section className="border border-border bg-card p-5 md:p-7 space-y-6">
        <div>
          <h3 className="font-serif text-xl mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" /> {s.share}
          </h3>
          <p className="text-sm text-foreground/60 max-w-2xl">{s.shareHint}</p>
        </div>
        <form
          className="grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label>{s.recipient}</Label>
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} required maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label>{s.duration}</Label>
            <select value={hours} onChange={(e) => setHours(e.target.value)} className="w-full h-9 border border-input bg-background px-2 text-sm">
              {Object.keys(s.hours).map((h) => (
                <option key={h} value={h}>
                  {s.hours[h]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>{s.maxOpens}</Label>
            <select value={maxViews} onChange={(e) => setMaxViews(e.target.value)} className="w-full h-9 border border-input bg-background px-2 text-sm" dir="ltr">
              {["3", "5", "10", "20", "50"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={create.isPending || !recipient.trim()}>
            {s.createLink}
          </Button>
        </form>
        {err && <p className="text-sm text-destructive">{err}</p>}

        {made && (
          <div className="border border-primary/40 bg-primary/5 p-4 space-y-3">
            <p className="text-sm font-medium">{s.linkReady}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs w-16 text-foreground/50">{s.link}</span>
              <code className="flex-1 min-w-0 break-all text-xs bg-background border border-border px-2 py-2" dir="ltr">
                {made.url}
              </code>
              <CopyBtn value={made.url} label={s.copy} done={s.copied} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs w-16 text-foreground/50">{s.pin}</span>
              <code className="text-2xl tracking-[0.4em] font-semibold bg-background border border-border px-3 py-1" dir="ltr">
                {made.pin}
              </code>
              <CopyBtn value={made.pin} label={s.copy} done={s.copied} />
            </div>
            <p className="text-xs text-foreground/60">{s.sendSeparately}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-2">{s.links}</p>
          {!shares.data?.shares.length ? (
            <p className="text-sm text-foreground/50">{s.noLinks}</p>
          ) : (
            <div className="overflow-x-auto border border-border/60">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border/60">
                  {shares.data.shares.map((r) => {
                    const st = shareState(r);
                    return (
                      <tr key={r.id} className="align-top">
                        <td className="p-3">
                          <div className="font-medium">{r.recipient}</div>
                          <div className="text-xs text-foreground/50" dir="ltr">
                            {fmtDate(r.createdAt)} → {fmtDate(r.expiresAt)}
                          </div>
                          {r.opens.length > 0 && (
                            <details className="mt-1 text-xs text-foreground/60">
                              <summary className="cursor-pointer">
                                {s.lastOpen}: <span dir="ltr">{fmtDate(r.lastOpenedAt)}</span>
                              </summary>
                              <ul className="mt-1 space-y-0.5" dir="ltr">
                                {r.opens.map((o, i) => (
                                  <li key={i}>
                                    {fmtDate(o.at)} · {o.ip}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </td>
                        <td className="p-3 text-xs whitespace-nowrap" dir="ltr">
                          {r.views}/{r.maxViews} {s.opens}
                        </td>
                        <td className="p-3 text-xs">
                          <span className={st === "active" ? "text-emerald-700" : st === "too_many_wrong_pins" ? "text-red-700" : "text-foreground/50"}>{s.shareState[st]}</span>
                        </td>
                        <td className="p-3 text-end">
                          {st === "active" && (
                            <button onClick={() => revoke.mutate(r.id)} className="text-xs text-red-700 hover:underline">
                              {s.revoke}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
