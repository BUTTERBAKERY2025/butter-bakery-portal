import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Copy, Download, ExternalLink, FileText, Lock, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError, fmtDate } from "./api";
import { useStaffText } from "./i18n";
import { BRAND_SWATCHES, hasColour, withColour } from "./Design3D";
import {
  asset, CATEGORIES, fileName, isImage, mainColour, PRINT_STEPS, STATUSES, toViewer, uploadDesignFile,
  type CommentRow, type DesignRow, type OrderRow, type ShareRow, type Specs, type StoredModel, type VersionRow,
} from "./designApi";
import { STATUS_STYLE } from "./StaffDesigns";

const Design3D = lazy(() => import("./Design3D").then((m) => ({ default: m.Design3D })));

type Tab = "overview" | "edit" | "versions" | "comments" | "print" | "share";

function Viewer({ model, tint, className = "" }: { model: StoredModel | null; tint?: string | null; className?: string }) {
  const { s } = useStaffText();
  if (!model) return <div className={`flex items-center justify-center text-sm text-foreground/45 ${className}`}>{s.no3dYet}</div>;
  return (
    <Suspense fallback={null}>
      <Design3D model={withColour(toViewer(model), tint)} text={s.d3} className={className} />
    </Suspense>
  );
}

function CopyBtn({ value }: { value: string }) {
  const { s } = useStaffText();
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
          /* clipboard blocked; the value stays visible */
        }
      }}
      className="inline-flex items-center gap-1.5 text-xs border border-border px-3 py-2 hover:border-primary hover:text-primary shrink-0"
    >
      <Copy className="w-3.5 h-3.5" /> {ok ? s.copied : s.copy}
    </button>
  );
}

function FileList({ files, onRemove }: { files: string[]; onRemove?: (p: string) => void }) {
  const { s } = useStaffText();
  return (
    <ul className="divide-y divide-border border-y border-border">
      {files.map((f) => (
        <li key={f} className="flex items-center gap-3 py-2 text-xs">
          <FileText className="w-4 h-4 text-foreground/40 shrink-0" />
          <span className="flex-1 break-all" dir="ltr">{fileName(f)}</span>
          <a href={asset(f)} target="_blank" rel="noopener" className="text-foreground/60 hover:text-primary inline-flex items-center gap-1">
            <ExternalLink className="w-3.5 h-3.5" /> {s.view}
          </a>
          <a href={asset(f, true)} className="text-primary inline-flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> {s.download}
          </a>
          {onRemove && (
            <button onClick={() => onRemove(f)} className="text-red-700/70 hover:text-red-700" title={s.remove}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function UploadButton({ designId, accept, multiple = true, onDone, label }: { designId: number; accept?: string; multiple?: boolean; onDone: (paths: string[]) => void; label: string }) {
  const { s } = useStaffText();
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState("");
  return (
    <span className="inline-flex flex-col gap-1">
      <label className={`inline-flex items-center gap-2 text-xs border border-dashed border-foreground/30 px-3 py-2 cursor-pointer hover:border-primary hover:text-primary ${busy ? "opacity-60 pointer-events-none" : ""}`}>
        <Upload className="w-3.5 h-3.5" /> {busy ? `${s.uploadingN} ${busy}…` : label}
        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={async (e) => {
            const list = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (!list.length) return;
            setErr("");
            setBusy(list.length);
            const out: string[] = [];
            for (const f of list) {
              try {
                out.push(await uploadDesignFile(designId, f));
              } catch (x) {
                setErr(`${f.name}: ${x instanceof Error ? x.message : x}`);
              }
              setBusy((n) => n - 1);
            }
            setBusy(0);
            if (out.length) onDone(out);
          }}
        />
      </label>
      {err && <span className="text-xs text-destructive">{err}</span>}
    </span>
  );
}

// ======================================================================
export function DesignDetail({ d, tab, setTab, onBack }: { d: DesignRow; tab: string; setTab: (t: Tab) => void; onBack: () => void }) {
  const { s, isAr } = useStaffText();
  const Back = isAr ? ArrowRight : ArrowLeft;
  const tabs: [Tab, string, number?][] = [
    ["overview", s.tOverview],
    ["edit", s.tEdit],
    ["versions", s.tVersions, d.proposals],
    ["comments", s.tComments],
    ["print", s.tPrint, d.openOrders],
    ["share", s.tShare, d.activeShares],
  ];
  const t = (tabs.some(([k]) => k === tab) ? tab : "overview") as Tab;
  return (
    <div>
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary mb-6">
        <Back className="w-4 h-4" /> {s.backToDesigns}
      </button>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="bb-eyebrow mb-2">{s.cat[d.category] ?? d.category}</p>
          <h1 className="font-serif text-3xl md:text-5xl leading-tight">{isAr ? d.nameAr : d.nameEn}</h1>
        </div>
        <StatusPicker d={d} />
      </div>
      <div className="flex gap-6 border-b border-border mb-8 overflow-x-auto">
        {tabs.map(([k, label, n]) => (
          <button key={k} onClick={() => setTab(k)} className={`relative text-sm pb-2.5 whitespace-nowrap border-b-2 -mb-px ${t === k ? "border-primary text-foreground" : "border-transparent text-foreground/50 hover:text-foreground"}`}>
            {label}
            {!!n && <span className={`ms-1.5 text-[0.62rem] px-1.5 py-0.5 rounded-full ${k === "versions" ? "bg-[var(--bb-orange)] text-white" : "bg-muted"}`} dir="ltr">{n}</span>}
          </button>
        ))}
      </div>
      {t === "overview" && <Overview d={d} />}
      {t === "edit" && <Editor d={d} onSaved={() => setTab("overview")} onDeleted={onBack} />}
      {t === "versions" && <Versions d={d} />}
      {t === "comments" && <Comments d={d} />}
      {t === "print" && <Print d={d} />}
      {t === "share" && <Share d={d} />}
    </div>
  );
}

function StatusPicker({ d }: { d: DesignRow }) {
  const { s } = useStaffText();
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (status: string) => api(`/admin/designs/${d.id}`, { method: "PATCH", body: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["designs"] }),
  });
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((st, i) => (
        <button
          key={st}
          onClick={() => m.mutate(st)}
          className={`text-xs px-3 py-1.5 border rounded-full inline-flex items-center gap-1.5 ${d.status === st ? STATUS_STYLE[st] + " font-semibold" : "border-border text-foreground/45 hover:border-foreground/40"}`}
        >
          <span dir="ltr" className="opacity-50">{i + 1}</span> {s.st[st]}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- overview
function Overview({ d }: { d: DesignRow }) {
  const { s, isAr } = useStaffText();
  const qc = useQueryClient();
  const [tint, setTint] = useState<string | null>(null);
  const saveColour = useMutation({
    mutationFn: () => api(`/admin/designs/${d.id}`, { method: "PATCH", body: { model: withColour(d.model as never, tint), versionNote: `${s.colourChanged} ${tint}` } }),
    onSuccess: () => {
      setTint(null);
      qc.invalidateQueries({ queryKey: ["designs"] });
    },
  });
  const [notes, setNotes] = useState(d.specs.notes ?? "");
  const saveNotes = useMutation({
    mutationFn: () => api(`/admin/designs/${d.id}`, { method: "PATCH", body: { notes } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["designs"] }),
  });
  const spec: [string, string | undefined][] = [
    [s.sizeL, d.specs.size],
    [s.materialL, d.specs.material],
    [s.coloursL, d.specs.colours?.join(" · ")],
    [s.useL, isAr ? d.specs.useAr ?? d.specs.use : d.specs.use],
  ];
  const images = d.images.filter(isImage);
  return (
    <div className="space-y-10">
      <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-8">
        <div className="space-y-3">
          <div className="bb-card bg-[#f3ece0] h-[420px] md:h-[560px] relative">
            <Viewer model={d.model} tint={tint} className="w-full h-full" />
          </div>
          {d.model && hasColour(toViewer(d.model)) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-foreground/55 me-1">{s.tryColour}</span>
              {BRAND_SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => setTint(c === mainColour(d.model) ? null : c)}
                  title={c}
                  className={`w-7 h-7 rounded-full border-2 ${((tint ?? mainColour(d.model)) || "").toLowerCase() === c.toLowerCase() ? "border-[var(--bb-orange)] scale-110" : "border-white shadow"}`}
                  style={{ background: c }}
                />
              ))}
              {tint && (
                <>
                  <Button size="sm" onClick={() => saveColour.mutate()} disabled={saveColour.isPending}>
                    {s.saveColour}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setTint(null)}>
                    {s.cancel}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="space-y-6 min-w-0">
          <dl className="divide-y divide-border border-y border-border text-sm">
            {spec.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex gap-4 py-3">
                <dt className="w-24 shrink-0 text-foreground/50">{k}</dt>
                <dd className="min-w-0">{v}</dd>
              </div>
            ))}
            <div className="flex gap-4 py-3">
              <dt className="w-24 shrink-0 text-foreground/50">{s.updated}</dt>
              <dd dir="ltr">{fmtDate(d.updatedAt)}</dd>
            </div>
          </dl>
          <div className="space-y-2">
            <Label>{s.notesL}</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-input bg-card px-3 py-2 text-sm" />
            <Button size="sm" variant="outline" onClick={() => saveNotes.mutate()} disabled={saveNotes.isPending || notes === (d.specs.notes ?? "")}>
              {s.saveNotes}
            </Button>
          </div>
          {d.files.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">{s.printFiles}</p>
              <FileList files={d.files} />
            </div>
          )}
          {d.missing.length > 0 && <p className="text-xs text-red-700" dir="ltr">{s.missingFiles}: {d.missing.join(", ")}</p>}
        </div>
      </div>
      {images.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3">{s.gallery}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((p) => (
              <a key={p} href={asset(p)} target="_blank" rel="noopener" className="block aspect-[4/3] bb-card overflow-hidden">
                <img src={asset(p)} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- editor
function Num({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <label className="space-y-1 block">
      <span className="text-xs text-foreground/60">{label}</span>
      <Input type="number" dir="ltr" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
function Swatch({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-foreground/60">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {BRAND_SWATCHES.map((c) => (
          <button key={c} type="button" title={c} onClick={() => onChange(c)} className={`w-7 h-7 rounded-full border-2 ${value.toLowerCase() === c.toLowerCase() ? "border-[var(--bb-orange)]" : "border-white shadow"}`} style={{ background: c }} />
        ))}
        <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="w-8 h-8 p-0 border border-border bg-transparent" />
      </div>
    </div>
  );
}

function ModelEditor({ designId, model, setModel, images }: { designId: number; model: StoredModel | null; setModel: (m: StoredModel | null) => void; images: string[] }) {
  const { s } = useStaffText();
  const pickImage = (key: "texture" | "front" | "back", current?: string) => (
    <div className="space-y-1.5">
      <span className="text-xs text-foreground/60">{s.art[key]}</span>
      <div className="flex flex-wrap items-center gap-2">
        {current && <img src={asset(current)} alt="" className="h-14 w-20 object-cover border border-border" />}
        <select
          className="h-9 border border-input bg-card px-2 text-xs max-w-[220px]"
          value={current ?? ""}
          onChange={(e) => model && setModel({ ...model, [key]: e.target.value || undefined } as StoredModel)}
        >
          <option value="">—</option>
          {images.filter(isImage).map((p) => (
            <option key={p} value={p}>{fileName(p)}</option>
          ))}
        </select>
        <UploadButton designId={designId} multiple={false} accept="image/*" label={s.uploadImage} onDone={([p]) => model && setModel({ ...model, [key]: p } as StoredModel)} />
      </div>
    </div>
  );
  const types: StoredModel["type"][] = ["box", "bag", "pouch", "carrier", "card", "cup", "flat"];
  const startType = (t: StoredModel["type"]) => {
    const art = images.find(isImage) ?? "";
    const base: Record<string, StoredModel> = {
      box: { type: "box", L: 200, W: 150, H: 80, color: "#FE5000", logoColor: "#F1E9DA", logo: "logos/svg/logo-primary-color.svg" },
      bag: { type: "bag", w: 260, h: 320, d: 140, color: "#F1E9DA", logoColor: "#FE5000", logo: "logos/svg/logo-primary-color.svg", handles: "rope" },
      pouch: { type: "pouch", w: 140, h: 220, d: 80, color: "#2A1F15", logo: "logos/svg/logo-primary-color.svg", logoColor: "#C08B3D" },
      carrier: { type: "carrier", cups: 4, color: "#C8B79A", logo: "logos/svg/logo-icon-color.svg", logoColor: "#FE5000" },
      card: { type: "card", w: 90, h: 50, bg: "#FE5000", logo: "logos/svg/logo-primary-color.svg", logoColor: "#F1E9DA", backBg: "#F1E9DA", symbol: "logos/svg/logo-icon-color.svg", symbolColor: "#FE5000" },
      cup: { type: "cup", oz: "12", colour: "morning", texture: art },
      flat: { type: "flat", w: 210, h: 297, d: 1, front: art, standing: true },
    };
    setModel(base[t]!);
  };
  const m = model;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t} type="button" onClick={() => (m?.type === t ? null : startType(t))} className={`text-xs px-3 py-2 border ${m?.type === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
            {s.mt[t]}
          </button>
        ))}
        {m && (
          <button type="button" onClick={() => setModel(null)} className="text-xs px-3 py-2 border border-border text-foreground/50 hover:text-red-700">
            {s.mt.none}
          </button>
        )}
      </div>
      {m?.type === "box" && (
        <div className="grid grid-cols-3 gap-3">
          <Num label={s.dims.L} value={m.L} onChange={(L) => setModel({ ...m, L })} />
          <Num label={s.dims.W} value={m.W} onChange={(W) => setModel({ ...m, W })} />
          <Num label={s.dims.H} value={m.H} onChange={(H) => setModel({ ...m, H })} />
          <div className="col-span-3 grid sm:grid-cols-2 gap-4">
            <Swatch label={s.boxColour} value={m.color} onChange={(color) => setModel({ ...m, color })} />
            <Swatch label={s.logoColour} value={m.logoColor} onChange={(logoColor) => setModel({ ...m, logoColor })} />
          </div>
        </div>
      )}
      {(m?.type === "bag" || m?.type === "pouch") && (
        <div className="grid grid-cols-3 gap-3">
          <Num label={s.dims.w} value={m.w} onChange={(w) => setModel({ ...m, w })} />
          <Num label={s.dims.h} value={m.h} onChange={(h) => setModel({ ...m, h })} />
          <Num label={s.dims.d} value={m.d} onChange={(d) => setModel({ ...m, d })} />
          <div className="col-span-3 grid sm:grid-cols-2 gap-4">
            <Swatch label={s.mainColour} value={m.color} onChange={(color) => setModel({ ...m, color })} />
            <Swatch label={s.logoColour} value={m.logoColor ?? "#FE5000"} onChange={(logoColor) => setModel({ ...m, logoColor } as StoredModel)} />
          </div>
          {m.type === "bag" && (
            <div className="col-span-3 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-foreground/60 me-2">{s.handles}</span>
              {(["rope", "flat", "none"] as const).map((h) => (
                <button key={h} type="button" onClick={() => setModel({ ...m, handles: h })} className={`text-xs px-3 py-1.5 border ${(m.handles ?? "rope") === h ? "border-primary text-primary" : "border-border"}`}>
                  {s.handleT[h]}
                </button>
              ))}
            </div>
          )}
          <div className="col-span-3">{pickImage("front", m.front)}</div>
          <p className="col-span-3 text-xs text-foreground/50">{s.frontOptional}</p>
        </div>
      )}
      {m?.type === "carrier" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {([2, 4] as const).map((n) => (
              <button key={n} type="button" onClick={() => setModel({ ...m, cups: n })} className={`text-xs px-3 py-1.5 border ${m.cups === n ? "border-primary text-primary" : "border-border"}`} dir="ltr">
                {n} {s.cupsWord}
              </button>
            ))}
          </div>
          <Swatch label={s.mainColour} value={m.color} onChange={(color) => setModel({ ...m, color })} />
        </div>
      )}
      {m?.type === "card" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Swatch label={s.cardFront} value={m.bg} onChange={(bg) => setModel({ ...m, bg })} />
          <Swatch label={s.logoColour} value={m.logoColor} onChange={(logoColor) => setModel({ ...m, logoColor })} />
          <Swatch label={s.cardBack} value={m.backBg} onChange={(backBg) => setModel({ ...m, backBg })} />
          <Swatch label={s.symbolColour} value={m.symbolColor} onChange={(symbolColor) => setModel({ ...m, symbolColor })} />
        </div>
      )}
      {m?.type === "cup" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {["4", "9", "12", "16"].map((oz) => (
              <button key={oz} type="button" onClick={() => setModel({ ...m, oz })} className={`text-xs px-3 py-1.5 border ${m.oz === oz ? "border-primary text-primary" : "border-border"}`} dir="ltr">
                {oz} oz
              </button>
            ))}
          </div>
          {pickImage("texture", m.texture || undefined)}
          <p className="text-xs text-foreground/50">{s.cupArtHint}</p>
        </div>
      )}
      {m?.type === "flat" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Num label={s.dims.w} value={m.w} onChange={(w) => setModel({ ...m, w })} />
          <Num label={s.dims.h} value={m.h} onChange={(h) => setModel({ ...m, h })} />
          <label className="flex items-end gap-2 text-xs pb-2">
            <input type="checkbox" checked={m.standing !== false} onChange={(e) => setModel({ ...m, standing: e.target.checked })} /> {s.standing}
          </label>
          <div className="col-span-full">{pickImage("front", m.front || undefined)}</div>
          <div className="col-span-full">{pickImage("back", m.back)}</div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs text-foreground/60">{label}</span>
      {children}
    </label>
  );
}

function Editor({ d, onSaved, onDeleted }: { d: DesignRow; onSaved: () => void; onDeleted: () => void }) {
  const { s } = useStaffText();
  const qc = useQueryClient();
  const [nameEn, setNameEn] = useState(d.nameEn);
  const [nameAr, setNameAr] = useState(d.nameAr);
  const [category, setCategory] = useState(d.category);
  const [specs, setSpecs] = useState<Specs>({ ...d.specs });
  const [colours, setColours] = useState((d.specs.colours ?? []).join(", "));
  const [model, setModel] = useState<StoredModel | null>(d.model);
  const [images, setImages] = useState<string[]>(d.images);
  const [files, setFiles] = useState<string[]>(d.files);
  const [versionNote, setVersionNote] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => setErr(""), [model, images, files]);

  const save = useMutation({
    mutationFn: () =>
      api(`/admin/designs/${d.id}`, {
        method: "PATCH",
        body: {
          nameEn, nameAr, category,
          specs: { ...specs, colours: colours.split(",").map((c) => c.trim()).filter(Boolean) },
          model, images, files, versionNote,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["designs"] });
      qc.invalidateQueries({ queryKey: ["versions", d.id] });
      onSaved();
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : String(e)),
  });
  const del = useMutation({
    mutationFn: () => api(`/admin/designs/${d.id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["designs"] });
      onDeleted();
    },
  });
  const [confirmDel, setConfirmDel] = useState(false);
  const move = (i: number) => setImages((xs) => [xs[i]!, ...xs.filter((_, j) => j !== i)]);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10">
      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="font-serif text-xl">{s.basics}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={s.nameEnL}><Input dir="ltr" value={nameEn} onChange={(e) => setNameEn(e.target.value)} /></Field>
            <Field label={s.nameArL}><Input dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} /></Field>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={`text-xs px-3 py-1.5 border ${category === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                {s.cat[c] ?? c}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={s.sizeL}><Input value={specs.size ?? ""} onChange={(e) => setSpecs({ ...specs, size: e.target.value })} /></Field>
            <Field label={s.materialL}><Input value={specs.material ?? ""} onChange={(e) => setSpecs({ ...specs, material: e.target.value })} /></Field>
            <Field label={s.coloursHint}><Input value={colours} onChange={(e) => setColours(e.target.value)} /></Field>
            <Field label={`${s.useL} (EN)`}><Input dir="ltr" value={specs.use ?? ""} onChange={(e) => setSpecs({ ...specs, use: e.target.value })} /></Field>
            <Field label={`${s.useL} (AR)`}><Input dir="rtl" value={specs.useAr ?? ""} onChange={(e) => setSpecs({ ...specs, useAr: e.target.value })} /></Field>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-xl">{s.gallery}</h3>
            <UploadButton designId={d.id} accept="image/*" label={s.uploadImages} onDone={(ps) => setImages((xs) => [...xs, ...ps])} />
          </div>
          {!images.length ? (
            <p className="text-sm text-foreground/50">{s.noImagesYet}</p>
          ) : (
            <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((p, i) => (
                <li key={p} className="relative group bb-card overflow-hidden aspect-[4/3]">
                  {isImage(p) ? <img src={asset(p)} alt="" className="w-full h-full object-cover" /> : <span className="text-[0.6rem] p-2 block break-all">{fileName(p)}</span>}
                  {i === 0 && <span className="absolute top-1 start-1 text-[0.58rem] px-1.5 py-0.5 bg-[var(--bb-orange)] text-white">{s.coverImg}</span>}
                  <span className="absolute bottom-1 end-1 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                    {i > 0 && (
                      <button type="button" onClick={() => move(i)} className="text-[0.6rem] px-1.5 py-0.5 bg-white/90">{s.makeCover}</button>
                    )}
                    <button type="button" onClick={() => setImages((xs) => xs.filter((x) => x !== p))} className="p-1 bg-white/90 text-red-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-xl">{s.printFiles}</h3>
            <UploadButton designId={d.id} accept=".pdf,.ai,.eps,.psd,.svg,.zip,.png,.jpg" label={s.uploadFiles} onDone={(ps) => setFiles((xs) => [...xs, ...ps])} />
          </div>
          {files.length ? <FileList files={files} onRemove={(p) => setFiles((xs) => xs.filter((x) => x !== p))} /> : <p className="text-sm text-foreground/50">{s.noFilesYet}</p>}
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="font-serif text-xl">{s.model3d}</h3>
          <div className="bb-card bg-[#f3ece0] h-[360px] relative">
            <Viewer model={model && (model.type !== "cup" || model.texture) && (model.type !== "flat" || model.front) ? model : null} className="w-full h-full" />
          </div>
          <ModelEditor designId={d.id} model={model} setModel={setModel} images={images} />
        </section>
        <section className="space-y-3 border-t border-border pt-6">
          <Label>{s.versionNote}</Label>
          <Input value={versionNote} onChange={(e) => setVersionNote(e.target.value)} placeholder={s.versionNotePh} />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="gap-2">
              <Check className="w-4 h-4" /> {s.saveDesign}
            </Button>
            <Button variant="outline" onClick={onSaved}>
              {s.cancel}
            </Button>
          </div>
          <p className="text-xs text-foreground/50">{s.saveMakesVersion}</p>
        </section>
        <section className="border-t border-border pt-6">
          {!confirmDel ? (
            <button onClick={() => setConfirmDel(true)} className="text-xs text-red-700/80 hover:text-red-700 inline-flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> {s.deleteDesign}
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-red-700">{s.deleteConfirm}</span>
              <Button size="sm" variant="destructive" onClick={() => del.mutate()}>{s.deleteDesign}</Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmDel(false)}>{s.cancel}</Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- versions
function Versions({ d }: { d: DesignRow }) {
  const { s } = useStaffText();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["versions", d.id], queryFn: () => api<{ versions: VersionRow[] }>(`/admin/designs/${d.id}/versions`) });
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [compare, setCompare] = useState<number[]>([]);
  const act = useMutation({
    mutationFn: ({ id, kind }: { id: number; kind: "approve" | "reject" }) => api(`/admin/versions/${id}/${kind}`, { method: "POST", body: { note: notes[id] ?? "" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["versions", d.id] });
      qc.invalidateQueries({ queryKey: ["designs"] });
      qc.invalidateQueries({ queryKey: ["comments", d.id] });
    },
  });
  const vs = q.data?.versions ?? [];
  const pair = compare.map((id) => vs.find((v) => v.id === id)).filter(Boolean) as VersionRow[];
  const badge: Record<string, string> = {
    current: "bg-[#524727] text-[#f1e9da]",
    proposed: "bg-[var(--bb-orange)] text-white",
    rejected: "bg-red-50 text-red-800 border border-red-200",
    superseded: "bg-muted text-foreground/60",
  };
  return (
    <div className="space-y-8">
      {pair.length === 2 && (
        <section className="bb-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl">{s.compare} · <span dir="ltr">v{pair[0]!.number} ↔ v{pair[1]!.number}</span></h3>
            <button onClick={() => setCompare([])} className="text-xs text-foreground/50 hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {pair.map((v) => (
              <div key={v.id} className="space-y-3">
                <p className="text-sm font-semibold" dir="ltr">v{v.number} · {v.author.replace(/^link:/, "🔗 ")}</p>
                <div className="bg-[#f3ece0] h-[300px] border border-border relative">
                  {v.images.find(isImage) ? <img src={asset(v.images.find(isImage)!)} alt="" className="w-full h-full object-contain" /> : <Viewer model={v.model} className="w-full h-full" />}
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {v.images.filter(isImage).slice(1).map((p) => (
                    <img key={p} src={asset(p)} alt="" className="h-16 w-24 object-cover border border-border shrink-0" />
                  ))}
                </div>
                <ul className="text-xs space-y-1" dir="ltr">
                  {v.files.map((f) => (
                    <li key={f} className={pair.every((o) => o.files.includes(f)) ? "text-foreground/50" : "text-[var(--bb-orange)] font-semibold"}>{fileName(f)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
      <p className="text-xs text-foreground/50">{s.compareHint}</p>
      <ul className="space-y-3">
        {vs.map((v) => {
          const img = v.images.find(isImage);
          return (
            <li key={v.id} className={`bb-card p-4 flex flex-col sm:flex-row gap-4 ${v.status === "proposed" ? "border-[var(--bb-orange)]" : ""}`}>
              <label className="flex sm:flex-col items-center gap-2 shrink-0">
                <input type="checkbox" checked={compare.includes(v.id)} onChange={(e) => setCompare((c) => (e.target.checked ? [...c.slice(-1), v.id] : c.filter((x) => x !== v.id)))} />
                <span className="font-serif text-2xl" dir="ltr">v{v.number}</span>
              </label>
              <div className="w-full sm:w-40 aspect-[4/3] bg-[#f3ece0] border border-border shrink-0 overflow-hidden">
                {img ? <img src={asset(img)} alt="" className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-[0.65rem] text-foreground/40">3D</span>}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[0.65rem] px-2 py-0.5 rounded-full ${badge[v.status]}`}>{s.vs[v.status]}</span>
                  <span className="text-xs text-foreground/60" dir="ltr">{v.author.replace(/^link:/, "🔗 ")} · {fmtDate(v.createdAt)}</span>
                </div>
                {v.note && <p className="text-sm">{v.note}</p>}
                {v.decisionNote && <p className="text-xs text-foreground/60">↳ {v.decidedBy}: {v.decisionNote}</p>}
                {v.files.length > 0 && v.status === "proposed" && <FileList files={v.files} />}
                {v.status === "proposed" && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Input value={notes[v.id] ?? ""} onChange={(e) => setNotes({ ...notes, [v.id]: e.target.value })} placeholder={s.replyToDesigner} className="max-w-sm h-9" />
                    <Button size="sm" onClick={() => act.mutate({ id: v.id, kind: "approve" })} className="gap-1.5"><Check className="w-3.5 h-3.5" /> {s.approve}</Button>
                    <Button size="sm" variant="outline" onClick={() => act.mutate({ id: v.id, kind: "reject" })} className="gap-1.5"><X className="w-3.5 h-3.5" /> {s.reject}</Button>
                  </div>
                )}
                {v.status === "superseded" && (
                  <button onClick={() => act.mutate({ id: v.id, kind: "approve" })} className="text-xs text-primary inline-flex items-center gap-1.5 hover:underline">
                    <RotateCcw className="w-3.5 h-3.5" /> {s.restore}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- comments
function Comments({ d }: { d: DesignRow }) {
  const { s } = useStaffText();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["comments", d.id], queryFn: () => api<{ comments: CommentRow[] }>(`/admin/designs/${d.id}/comments`) });
  const shares = useQuery({ queryKey: ["shares", d.id], queryFn: () => api<{ shares: ShareRow[] }>(`/admin/designs/${d.id}/shares`) });
  const [body, setBody] = useState("");
  const [to, setTo] = useState("");
  const add = useMutation({
    mutationFn: () => api(`/admin/designs/${d.id}/comments`, { method: "POST", body: { body, shareId: to ? Number(to) : null } }),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["comments", d.id] });
    },
  });
  const linkShares = (shares.data?.shares ?? []).filter((x) => x.allowSubmit);
  return (
    <div className="max-w-3xl space-y-6">
      <ul className="space-y-3">
        {(q.data?.comments ?? []).map((c) => (
          <li key={c.id} className={`flex ${c.fromStaff ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] px-4 py-3 ${c.fromStaff ? "bb-card" : "bg-[var(--bb-brown)] text-[var(--bb-cream)]"}`}>
              <p className="text-[0.68rem] opacity-60 mb-1" dir="ltr">
                {c.author.replace(/^link:/, "🔗 ")}
                {c.recipient && c.fromStaff ? ` → ${c.recipient}` : ""} · {fmtDate(c.createdAt)}
              </p>
              <p className="text-sm whitespace-pre-wrap">{c.body}</p>
            </div>
          </li>
        ))}
        {!q.data?.comments.length && <p className="text-sm text-foreground/50">{s.noComments}</p>}
      </ul>
      <form
        className="bb-card p-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) add.mutate();
        }}
      >
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder={s.writeComment} className="w-full border border-input bg-background px-3 py-2 text-sm" />
        <div className="flex flex-wrap items-center gap-3">
          <select value={to} onChange={(e) => setTo(e.target.value)} className="h-9 border border-input bg-card px-2 text-xs">
            <option value="">{s.internalOnly}</option>
            {linkShares.map((x) => (
              <option key={x.id} value={x.id}>
                {s.visibleTo} {x.recipient}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={add.isPending || !body.trim()}>{s.send}</Button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- print orders
function Print({ d }: { d: DesignRow }) {
  const { s } = useStaffText();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["orders", d.id], queryFn: () => api<{ orders: OrderRow[] }>(`/admin/designs/${d.id}/orders`) });
  const [f, setF] = useState({ printer: "", quantity: "1000", unit: "pcs", dueDate: "", notes: "" });
  const [err, setErr] = useState("");
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["orders", d.id] });
    qc.invalidateQueries({ queryKey: ["designs"] });
    qc.invalidateQueries({ queryKey: ["summary"] });
  };
  const create = useMutation({
    mutationFn: () => api(`/admin/designs/${d.id}/orders`, { method: "POST", body: { ...f, quantity: Number(f.quantity) } }),
    onSuccess: () => {
      setF({ ...f, printer: "", notes: "" });
      setErr("");
      refresh();
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : String(e)),
  });
  const move = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api(`/admin/orders/${id}`, { method: "PATCH", body: { status } }),
    onSuccess: refresh,
  });
  return (
    <div className="space-y-8">
      <form
        className="bb-card p-5 grid sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.6fr_0.9fr_auto] gap-3 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <label className="space-y-1.5 block"><span className="text-xs text-foreground/60">{s.printer}</span><Input value={f.printer} onChange={(e) => setF({ ...f, printer: e.target.value })} required /></label>
        <label className="space-y-1.5 block"><span className="text-xs text-foreground/60">{s.quantity}</span><Input type="number" dir="ltr" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} required /></label>
        <label className="space-y-1.5 block"><span className="text-xs text-foreground/60">{s.unit}</span><Input dir="ltr" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} /></label>
        <label className="space-y-1.5 block"><span className="text-xs text-foreground/60">{s.dueDate}</span><Input type="date" dir="ltr" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></label>
        <Button type="submit" disabled={create.isPending}>{s.newOrder}</Button>
        <label className="space-y-1.5 block sm:col-span-2 lg:col-span-5"><span className="text-xs text-foreground/60">{s.notesL}</span><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
        {err && <p className="text-sm text-destructive sm:col-span-2 lg:col-span-5">{err}</p>}
      </form>
      {!q.data?.orders.length && <p className="text-sm text-foreground/50">{s.noOrders}</p>}
      <ul className="space-y-4">
        {(q.data?.orders ?? []).map((o) => {
          const idx = PRINT_STEPS.indexOf(o.status);
          return (
            <li key={o.id} className="bb-card p-5 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-serif text-xl">{o.printer}</p>
                <p className="text-sm" dir="ltr">
                  {o.quantity.toLocaleString("en-US")} {o.unit}
                  {o.dueDate ? ` · ${s.dueDate} ${o.dueDate}` : ""}
                </p>
              </div>
              {o.status === "cancelled" ? (
                <p className="text-sm text-red-700">{s.ps.cancelled}</p>
              ) : (
                <ol className="grid grid-cols-5 gap-1">
                  {PRINT_STEPS.map((st, i) => (
                    <li key={st}>
                      <button
                        onClick={() => move.mutate({ id: o.id, status: st })}
                        className={`w-full text-start text-[0.65rem] leading-tight pt-2 border-t-4 ${i <= idx ? "border-[var(--bb-orange)] text-foreground" : "border-border text-foreground/40 hover:text-foreground"}`}
                      >
                        {s.ps[st]}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
              {o.notes && <p className="text-sm text-foreground/70">{o.notes}</p>}
              <details className="text-xs text-foreground/60">
                <summary className="cursor-pointer">{s.timeline}</summary>
                <ul className="mt-2 space-y-1" dir="ltr">
                  {o.timeline.map((t, i) => (
                    <li key={i}>{fmtDate(t.at)} · {s.ps[t.status] ?? t.status} · {t.by}{t.note ? ` · ${t.note}` : ""}</li>
                  ))}
                </ul>
              </details>
              {o.status !== "cancelled" && o.status !== "delivered" && (
                <button onClick={() => move.mutate({ id: o.id, status: "cancelled" })} className="text-xs text-red-700/80 hover:text-red-700">{s.cancelOrder}</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- share links
function shareState(x: ShareRow): string {
  if (x.revokedAt) return x.revokedReason === "too_many_wrong_pins" ? "too_many_wrong_pins" : "revoked";
  if (new Date(x.expiresAt).getTime() <= Date.now()) return "expired";
  if (x.views >= x.maxViews) return "used_up";
  return "active";
}

function Share({ d }: { d: DesignRow }) {
  const { s } = useStaffText();
  const qc = useQueryClient();
  const [recipient, setRecipient] = useState("");
  const [hours, setHours] = useState("72");
  const [maxViews, setMaxViews] = useState("10");
  const [allowSubmit, setAllowSubmit] = useState(true);
  const [allowFiles, setAllowFiles] = useState(false);
  const [made, setMade] = useState<{ url: string; pin: string } | null>(null);
  const [err, setErr] = useState("");
  const shares = useQuery({ queryKey: ["shares", d.id], queryFn: () => api<{ shares: ShareRow[] }>(`/admin/designs/${d.id}/shares`) });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["shares", d.id] });
    qc.invalidateQueries({ queryKey: ["designs"] });
  };
  const create = useMutation({
    mutationFn: () => api<{ path: string; pin: string }>(`/admin/designs/${d.id}/shares`, { method: "POST", body: { recipient, hours: Number(hours), maxViews: Number(maxViews), allowSubmit, allowFiles } }),
    onSuccess: (r) => {
      setMade({ url: window.location.origin + r.path, pin: r.pin });
      setRecipient("");
      setErr("");
      refresh();
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : String(e)),
  });
  const revoke = useMutation({ mutationFn: (sid: number) => api(`/admin/shares/${sid}/revoke`, { method: "POST", body: {} }), onSuccess: refresh });
  return (
    <div className="space-y-8">
      <section className="bb-card p-5 md:p-7 space-y-5">
        <div>
          <h3 className="font-serif text-xl mb-2 flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> {s.share}</h3>
          <p className="text-sm text-foreground/60 max-w-2xl">{s.shareHint}</p>
        </div>
        <form
          className="grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <label className="space-y-1.5 block"><span className="text-xs text-foreground/60">{s.recipient}</span><Input value={recipient} onChange={(e) => setRecipient(e.target.value)} required maxLength={120} /></label>
          <label className="space-y-1.5 block">
            <span className="text-xs text-foreground/60">{s.duration}</span>
            <select value={hours} onChange={(e) => setHours(e.target.value)} className="w-full h-9 border border-input bg-card px-2 text-sm">
              {Object.keys(s.hours).map((h) => (<option key={h} value={h}>{s.hours[h]}</option>))}
            </select>
          </label>
          <label className="space-y-1.5 block">
            <span className="text-xs text-foreground/60">{s.maxOpens}</span>
            <select value={maxViews} onChange={(e) => setMaxViews(e.target.value)} className="w-full h-9 border border-input bg-card px-2 text-sm" dir="ltr">
              {["3", "5", "10", "20", "50"].map((v) => (<option key={v} value={v}>{v}</option>))}
            </select>
          </label>
          <div className="sm:col-span-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={allowSubmit} onChange={(e) => setAllowSubmit(e.target.checked)} /> {s.allowSubmit}</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={allowFiles} onChange={(e) => setAllowFiles(e.target.checked)} /> {s.allowFiles}</label>
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={create.isPending || !recipient.trim()}>{s.createLink}</Button>
          </div>
        </form>
        {err && <p className="text-sm text-destructive">{err}</p>}
        {made && (
          <div className="border border-primary/40 bg-primary/5 p-4 space-y-3">
            <p className="text-sm font-semibold">{s.linkReady}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs w-16 text-foreground/50">{s.link}</span>
              <code className="flex-1 min-w-0 break-all text-xs bg-background border border-border px-2 py-2" dir="ltr">{made.url}</code>
              <CopyBtn value={made.url} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs w-16 text-foreground/50">{s.pin}</span>
              <code className="text-2xl tracking-[0.4em] font-semibold bg-background border border-border px-3 py-1" dir="ltr">{made.pin}</code>
              <CopyBtn value={made.pin} />
            </div>
            <p className="text-xs text-foreground/60">{s.sendSeparately}</p>
          </div>
        )}
      </section>
      <section>
        <p className="text-sm font-semibold mb-2">{s.links}</p>
        {!shares.data?.shares.length ? (
          <p className="text-sm text-foreground/50">{s.noLinks}</p>
        ) : (
          <div className="overflow-x-auto bb-card">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {shares.data.shares.map((r) => {
                  const st = shareState(r);
                  return (
                    <tr key={r.id} className="align-top">
                      <td className="p-3">
                        <div className="font-semibold">{r.recipient}</div>
                        <div className="text-xs text-foreground/50" dir="ltr">{fmtDate(r.createdAt)} → {fmtDate(r.expiresAt)}</div>
                        <div className="text-[0.65rem] text-foreground/50 mt-1">
                          {r.allowSubmit && <span className="me-2">⬆ {s.allowSubmitShort}</span>}
                          {r.allowFiles && <span>⬇ {s.allowFilesShort}</span>}
                        </div>
                        {r.opens.length > 0 && (
                          <details className="mt-1 text-xs text-foreground/60">
                            <summary className="cursor-pointer">{s.lastOpen}: <span dir="ltr">{fmtDate(r.lastOpenedAt)}</span></summary>
                            <ul className="mt-1 space-y-0.5" dir="ltr">{r.opens.map((o, i) => (<li key={i}>{fmtDate(o.at)} · {o.ip}</li>))}</ul>
                          </details>
                        )}
                      </td>
                      <td className="p-3 text-xs whitespace-nowrap" dir="ltr">{r.views}/{r.maxViews} {s.opens}</td>
                      <td className="p-3 text-xs"><span className={st === "active" ? "text-[#524727] font-semibold" : st === "too_many_wrong_pins" ? "text-red-700" : "text-foreground/50"}>{s.shareState[st]}</span></td>
                      <td className="p-3 text-end">{st === "active" && <button onClick={() => revoke.mutate(r.id)} className="text-xs text-red-700 hover:underline">{s.revoke}</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
