import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useSearch } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Link2, Plus, Printer, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "./api";
import { useStaffText } from "./i18n";
import { StaffShell, useRequireMe } from "./StaffShell";
import { DesignDetail } from "./DesignDetail";
import { asset, CATEGORIES, cover, defaultModel, mainColour, STATUSES, type DesignRow, type StoredModel } from "./designApi";

export const STATUS_STYLE: Record<string, string> = {
  draft: "bg-[#c4b47e]/20 text-[#524727] border-[#c4b47e]/60",
  review: "bg-[#c08b3d]/15 text-[#7a5520] border-[#c08b3d]/50",
  approved: "bg-[#524727]/10 text-[#524727] border-[#524727]/40",
  print: "bg-[#fe5000]/10 text-[#c23d00] border-[#fe5000]/40",
};

function NewDesign({ onClose, onCreated }: { onClose: () => void; onCreated: (id: number) => void }) {
  const { s } = useStaffText();
  const qc = useQueryClient();
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [category, setCategory] = useState("boxes");
  const [type, setType] = useState<StoredModel["type"] | "none">("box");
  const [err, setErr] = useState("");
  const create = useMutation({
    mutationFn: () =>
      api<{ design: { id: number } }>("/admin/designs", {
        method: "POST",
        body: { nameEn, nameAr, category, model: type === "none" ? null : defaultModel(type) },
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["designs"] });
      onCreated(r.design.id);
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : String(e)),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };
  // Types that need artwork uploaded before they have a 3D view start without a model.
  const types: (StoredModel["type"] | "none")[] = ["box", "bag", "pouch", "carrier", "card", "cup", "flat", "none"];
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="staff-theme bb-card w-full sm:max-w-lg p-6 md:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <p className="bb-eyebrow mb-1">{s.designOffice}</p>
            <h2 className="font-serif text-3xl">{s.newDesign}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-foreground/50 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{s.nameEnL}</Label>
            <Input dir="ltr" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>{s.nameArL}</Label>
            <Input dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{s.categoryL}</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={`text-xs px-3 py-1.5 border ${category === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                {s.cat[c] ?? c}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{s.modelL}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {types.map((t) => (
              <button key={t} type="button" onClick={() => setType(t)} className={`text-xs px-2 py-2.5 border text-center ${type === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"}`}>
                {s.mt[t]}
              </button>
            ))}
          </div>
          <p className="text-xs text-foreground/50">{type === "cup" || type === "flat" ? s.modelNeedsArt : s.modelLater}</p>
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={create.isPending}>
            {s.createDesign}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            {s.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function StaffDesigns() {
  const { s, isAr } = useStaffText();
  const me = useRequireMe(true);
  const search = new URLSearchParams(useSearch());
  const [, navigate] = useLocation();
  const openId = Number(search.get("d")) || null;
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(search.get("new") === "1");
  const list = useQuery({ queryKey: ["designs"], queryFn: () => api<{ designs: DesignRow[] }>("/admin/designs"), enabled: !!me.data?.user.isAdmin });
  const designs = list.data?.designs ?? [];
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: designs.length };
    for (const d of designs) c[d.category] = (c[d.category] ?? 0) + 1;
    return c;
  }, [designs]);

  if (!me.data?.user.isAdmin) return <StaffShell me={me.data}>{null}</StaffShell>;
  const open = designs.find((d) => d.id === openId);
  const go = (id: number | null, tab?: string) => navigate(id ? `/staff/designs?d=${id}${tab ? `&tab=${tab}` : ""}` : "/staff/designs");

  if (open) {
    return (
      <StaffShell me={me.data}>
        <DesignDetail d={open} tab={search.get("tab") ?? "overview"} setTab={(t) => go(open.id, t)} onBack={() => go(null)} />
      </StaffShell>
    );
  }

  const needle = q.trim().toLowerCase();
  const shown = designs.filter(
    (d) =>
      (cat === "all" || d.category === cat) &&
      (status === "all" || d.status === status || (status === "waiting" && d.proposals > 0)) &&
      (!needle || d.nameEn.toLowerCase().includes(needle) || d.nameAr.includes(q.trim())),
  );
  const waiting = designs.filter((d) => d.proposals > 0).length;

  return (
    <StaffShell me={me.data}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="bb-eyebrow mb-2">{s.cat.all} · {designs.length}</p>
          <h1 className="font-serif text-4xl md:text-5xl">{s.designOffice}</h1>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" /> {s.newDesign}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-foreground/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.searchDesigns} className="ps-9" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...STATUSES, ...(waiting ? ["waiting"] : [])].map((st) => (
            <button key={st} onClick={() => setStatus(st)} className={`text-xs px-3 py-1.5 border rounded-full ${status === st ? "border-foreground bg-foreground text-background" : "border-border text-foreground/60 hover:border-foreground"}`}>
              {st === "all" ? s.cat.all : st === "waiting" ? `${s.waitingApproval} · ${waiting}` : s.st[st]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
        {["all", ...CATEGORIES].filter((c) => c === "all" || counts[c]).map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`text-sm px-1 pb-1 border-b-2 ${cat === c ? "border-primary text-foreground" : "border-transparent text-foreground/50 hover:text-foreground"}`}>
            {s.cat[c] ?? c} <span className="text-foreground/35 text-xs" dir="ltr">{counts[c] ?? 0}</span>
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {shown.map((d) => {
          const c = cover(d);
          const col = mainColour(d.model);
          return (
            <li key={d.id}>
              <button onClick={() => go(d.id)} className="group w-full text-start bb-card hover:border-[var(--bb-orange)] transition-colors flex flex-col h-full">
                <div className="relative aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: c ? "#ece4d6" : col ? `${col}22` : "#ece4d6" }}>
                  {c ? (
                    <img src={asset(c)} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  ) : col ? (
                    <span className="w-1/2 aspect-[4/3] rounded-sm shadow-[0_12px_30px_-10px_rgba(0,0,0,.35)]" style={{ background: col }} />
                  ) : (
                    <span className="text-xs text-foreground/40">{s.noImageYet}</span>
                  )}
                  <span className="absolute top-2 start-2 flex flex-wrap gap-1">
                    {d.proposals > 0 && (
                      <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-[var(--bb-orange)] text-white inline-flex items-center gap-1">
                        <Inbox className="w-3 h-3" /> <span dir="ltr">{d.proposals}</span>
                      </span>
                    )}
                    {d.openOrders > 0 && (
                      <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-[var(--bb-brown)] text-[var(--bb-cream)] inline-flex items-center gap-1">
                        <Printer className="w-3 h-3" /> <span dir="ltr">{d.openOrders}</span>
                      </span>
                    )}
                    {d.activeShares > 0 && (
                      <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-white/90 text-[var(--bb-brown)] inline-flex items-center gap-1">
                        <Link2 className="w-3 h-3" /> <span dir="ltr">{d.activeShares}</span>
                      </span>
                    )}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-foreground/45">{s.cat[d.category] ?? d.category}</p>
                  <p className="font-serif text-lg leading-snug">{isAr ? d.nameAr : d.nameEn}</p>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className={`text-[0.65rem] px-2 py-0.5 border rounded-full ${STATUS_STYLE[d.status] ?? STATUS_STYLE.draft}`}>{s.st[d.status] ?? d.status}</span>
                    {d.missing.length > 0 && <span className="text-[0.65rem] text-red-700">{s.missingFiles}</span>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {!shown.length && <p className="text-sm text-foreground/50 py-10 text-center">{s.noDesignsMatch}</p>}

      {creating && (
        <NewDesign
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            go(id, "edit");
          }}
        />
      )}
    </StaffShell>
  );
}
