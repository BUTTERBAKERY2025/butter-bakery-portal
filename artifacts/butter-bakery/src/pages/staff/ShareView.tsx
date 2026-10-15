import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import { useParams } from "wouter";
import { Download, FileText, Lock, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtDate } from "./api";
import { useStaffText } from "./i18n";
import { useNoIndex } from "./StaffShell";
import type { Model3D } from "./Design3D";

const Design3D = lazy(() => import("./Design3D").then((m) => ({ default: m.Design3D })));

interface Shared {
  recipient: string;
  expiresAt: string;
  allowSubmit: boolean;
  allowFiles: boolean;
  submissions: { number: number; status: string; note: string | null; decisionNote: string | null; createdAt: string; images: string[]; files: { name: string; url: string }[] }[];
  comments: { id: number; author: string; fromStaff: boolean; body: string; createdAt: string }[];
  design: {
    files: { name: string; url: string }[];
    nameEn: string;
    nameAr: string;
    category: string;
    specs: { size?: string; material?: string; colours?: string[]; use?: string; useAr?: string };
    model: Model3D | null;
    images: string[];
  };
}

const T = {
  en: {
    title: "Protected design",
    sub: "This design was shared with you privately. Enter the 6-digit PIN you received separately.",
    pin: "PIN",
    open: "Open design",
    wrong: "Wrong PIN.",
    locked: "This link has been locked after too many wrong PINs.",
    expired: "This link has expired.",
    used_up: "This link has been opened the maximum number of times.",
    revoked: "This link has been cancelled.",
    not_found: "This link doesn't exist.",
    tooMany: "Too many attempts. Try again in 15 minutes.",
    failed: "Something went wrong. Try again.",
    confidential: "Confidential · shared with",
    until: "Link valid until",
    size: "Size",
    material: "Material",
    colours: "Colours",
    use: "Use",
    note: "View only. Please don't capture or share. Every opening is logged.",
    printFiles: "Print files",
    yourRevision: "Send a revision",
    revisionHint: "Upload your updated artwork (images, PDF, AI, PSD, ZIP) and say what you changed. Butter will review it.",
    chooseFiles: "Choose files",
    whatChanged: "What did you change?",
    sendRevision: "Send revision",
    sending: "Sending…",
    sent: "Sent. Butter will review it.",
    yourRevisions: "Your revisions",
    vs: { proposed: "Waiting for review", current: "Approved", superseded: "Approved earlier", rejected: "Not approved" } as Record<string, string>,
    discussion: "Discussion",
    writeComment: "Write a message…",
    send: "Send",
    noComments: "No messages yet.",
  },
  ar: {
    title: "تصميم محمي",
    sub: "التصميم ده اتشارك معاك بشكل خاص. اكتب رمز PIN اللي وصلك في رسالة منفصلة (6 أرقام).",
    pin: "رمز PIN",
    open: "افتح التصميم",
    wrong: "الرمز غلط.",
    locked: "الرابط اتقفل بعد محاولات كتير غلط.",
    expired: "الرابط ده انتهى.",
    used_up: "الرابط اتفتح أقصى عدد مرات مسموح.",
    revoked: "الرابط ده اتلغى.",
    not_found: "الرابط ده مش موجود.",
    tooMany: "محاولات كتير. جرّب تاني بعد 15 دقيقة.",
    failed: "حصلت مشكلة. جرّب تاني.",
    confidential: "سري · متشارك مع",
    until: "الرابط شغال لحد",
    size: "المقاس",
    material: "الخامة",
    colours: "الألوان",
    use: "الاستخدام",
    note: "للمشاهدة فقط. من فضلك ما تصوّرش ولا تشارك. كل فتح بيتسجل.",
    printFiles: "ملفات الطباعة",
    yourRevision: "ابعت تعديل",
    revisionHint: "ارفع التصميم بعد التعديل (صور، PDF، AI، PSD، ZIP) واكتب إيه اللي غيّرته. بتر هتراجعه.",
    chooseFiles: "اختار الملفات",
    whatChanged: "إيه اللي غيّرته؟",
    sendRevision: "ابعت التعديل",
    sending: "جاري الإرسال…",
    sent: "اتبعت. بتر هتراجعه.",
    yourRevisions: "تعديلاتك",
    vs: { proposed: "مستني المراجعة", current: "اتعتمد", superseded: "اتعتمد قبل كده", rejected: "ما اتعتمدش" } as Record<string, string>,
    discussion: "النقاش",
    writeComment: "اكتب رسالة…",
    send: "ابعت",
    noComments: "لسه مفيش رسايل.",
  },
};

function Revision({ base, t, onDone }: { base: string; t: (typeof T)["en"]; onDone: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!files.length) return;
    setBusy(true);
    setMsg("");
    try {
      const images: string[] = [];
      const other: string[] = [];
      for (const f of files) {
        const r = await fetch(`${base}/upload?name=${encodeURIComponent(f.name)}`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/octet-stream" }, body: f });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(`${f.name}: ${j.error ?? r.status}`);
        (/\.(png|jpe?g|webp|gif|svg)$/i.test(f.name) ? images : other).push(j.path);
      }
      const r = await fetch(`${base}/submit`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note, images, files: other }) });
      if (!r.ok) throw new Error(String(r.status));
      setFiles([]);
      setNote("");
      setMsg(t.sent);
      onDone();
    } catch (x) {
      setMsg(`${x instanceof Error ? x.message : x}`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={send} className="border border-border bg-card p-5 space-y-4">
      <div>
        <h2 className="font-serif text-2xl mb-1">{t.yourRevision}</h2>
        <p className="text-sm text-foreground/60">{t.revisionHint}</p>
      </div>
      <label className="flex items-center gap-2 text-sm border border-dashed border-foreground/30 px-4 py-3 cursor-pointer hover:border-primary">
        <Upload className="w-4 h-4" /> {files.length ? files.map((f) => f.name).join(", ") : t.chooseFiles}
        <input type="file" multiple className="hidden" accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.ai,.eps,.psd,.zip" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
      </label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={t.whatChanged} className="w-full border border-input bg-background px-3 py-2 text-sm" />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy || !files.length}>{busy ? t.sending : t.sendRevision}</Button>
        {msg && <span className="text-sm text-foreground/70">{msg}</span>}
      </div>
    </form>
  );
}

function Discussion({ base, t, comments, onDone }: { base: string; t: (typeof T)["en"]; comments: Shared["comments"]; onDone: () => void }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">{t.discussion}</h2>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className={`flex ${c.fromStaff ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] px-4 py-3 ${c.fromStaff ? "border border-border bg-card" : "bg-[#2a1f15] text-[#f1e9da]"}`}>
              <p className="text-[0.68rem] opacity-60 mb-1" dir="ltr">{c.author} · {fmtDate(c.createdAt)}</p>
              <p className="text-sm whitespace-pre-wrap">{c.body}</p>
            </div>
          </li>
        ))}
        {!comments.length && <p className="text-sm text-foreground/50">{t.noComments}</p>}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!body.trim()) return;
          setBusy(true);
          await fetch(`${base}/comment`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) }).catch(() => undefined);
          setBody("");
          setBusy(false);
          onDone();
        }}
      >
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder={t.writeComment} className="flex-1 border border-input bg-background px-3 py-2 text-sm" />
        <Button type="submit" disabled={busy || !body.trim()}>{t.send}</Button>
      </form>
    </div>
  );
}

export default function ShareView() {
  const { token } = useParams<{ token: string }>();
  const { s, isAr, lang, toggleLang } = useStaffText();
  const t = isAr ? T.ar : T.en;
  useNoIndex();
  const base = `/api/share/${token}`;
  const [state, setState] = useState<"loading" | "pin" | "open" | "expired" | "used_up" | "revoked" | "not_found">("loading");
  const [data, setData] = useState<Shared | null>(null);
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const loadDesign = async () => {
    const r = await fetch(`${base}/design`, { credentials: "same-origin" });
    if (!r.ok) {
      setState("pin");
      return;
    }
    setData(await r.json());
    setState("open");
  };

  useEffect(() => {
    (async () => {
      const r = await fetch(base, { credentials: "same-origin" });
      const j = await r.json().catch(() => ({}));
      if (j.state === "ok") {
        if (j.unlocked) await loadDesign();
        else setState("pin");
      } else setState((j.state as typeof state) ?? "not_found");
    })().catch(() => setState("not_found"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch(`${base}/unlock`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) await loadDesign();
      else if (j.state === "wrong_pin") setMsg(t.wrong);
      else if (j.state === "too_many_attempts") setMsg(t.tooMany);
      else if (j.state === "revoked") {
        setMsg(t.locked);
        setState("revoked");
      } else if (j.state) setState(j.state);
      else setMsg(t.failed);
    } catch {
      setMsg(t.failed);
    } finally {
      setPin("");
      setBusy(false);
    }
  };

  const header = (
    <header className="bg-[var(--bb-brown)] text-[var(--bb-cream)]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <span className="flex items-center gap-3">
          <img src="/staff/logo-icon-cream.svg" alt="Butter" className="h-6 w-auto" />
          <span className="h-5 w-px bg-[var(--bb-cream)]/25" />
          <span className="text-[0.62rem] uppercase tracking-[0.32em] text-[var(--bb-cream)]/70">Design review</span>
        </span>
        <button onClick={toggleLang} className="text-xs tracking-widest px-3 py-1.5 border border-[var(--bb-cream)]/25 text-[var(--bb-cream)]/80 hover:border-[var(--bb-orange)]">
          {lang === "en" ? "عربي" : "EN"}
        </button>
      </div>
    </header>
  );

  if (state !== "open" || !data) {
    const closed = state === "expired" || state === "used_up" || state === "revoked" || state === "not_found";
    return (
      <div className="staff-theme min-h-screen">
        {header}
        <main className="max-w-sm mx-auto px-5 pt-14">
          <Lock className="w-6 h-6 text-primary mb-4" />
          <h1 className="font-serif text-3xl mb-3">{t.title}</h1>
          {state === "loading" ? null : closed ? (
            <p className="text-foreground/70">{msg || t[state]}</p>
          ) : (
            <>
              <p className="text-sm text-foreground/60 leading-relaxed mb-8">{t.sub}</p>
              <form onSubmit={submit} className="space-y-4">
                <label className="block text-sm" htmlFor="pin">
                  {t.pin}
                </label>
                <input
                  id="pin"
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full border border-input bg-background px-4 py-3 text-2xl tracking-[0.5em] text-center"
                  required
                />
                {msg && (
                  <p role="alert" className="text-sm text-destructive">
                    {msg}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={busy || pin.length !== 6}>
                  {t.open}
                </Button>
              </form>
            </>
          )}
        </main>
      </div>
    );
  }

  const d = data.design;
  const spec: [string, string | undefined][] = [
    [t.size, d.specs.size],
    [t.material, d.specs.material],
    [t.colours, d.specs.colours?.join(" · ")],
    [t.use, isAr ? d.specs.useAr ?? d.specs.use : d.specs.use],
  ];
  return (
    <div className="staff-theme min-h-screen" onContextMenu={(e) => e.preventDefault()}>
      {header}
      <main className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-primary uppercase tracking-[0.25em] mb-2">{s.cat[d.category] ?? d.category}</p>
            <h1 className="font-serif text-3xl">{isAr ? d.nameAr : d.nameEn}</h1>
          </div>
          <p className="text-xs text-foreground/50">
            {t.until} <span dir="ltr">{fmtDate(data.expiresAt)}</span>
          </p>
        </div>
        <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-8">
          <div className="relative border border-border/60 bg-[#f6efe2] h-[440px] md:h-[560px]">
            {d.model ? (
              <Suspense fallback={null}>
                <Design3D model={d.model} text={s.d3} className="w-full h-full" />
              </Suspense>
            ) : (
              d.images[0] && <img src={d.images[0]} alt="" draggable={false} className="w-full h-full object-contain" />
            )}
            <span className="absolute top-3 start-3 text-[0.65rem] tracking-wide text-foreground/40 pointer-events-none">
              {t.confidential} {data.recipient}
            </span>
          </div>
          <div className="space-y-6">
            <dl className="divide-y divide-border/60 border-y border-border/60 text-sm">
              {spec
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex gap-4 py-2.5">
                    <dt className="w-24 shrink-0 text-foreground/50">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
            <p className="text-xs text-foreground/50 flex gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {t.note}
            </p>
            {data.allowFiles && d.files.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">{t.printFiles}</p>
                <ul className="divide-y divide-border border-y border-border">
                  {d.files.map((f) => (
                    <li key={f.url} className="flex items-center gap-3 py-2 text-xs">
                      <FileText className="w-4 h-4 text-foreground/40" />
                      <span className="flex-1 break-all" dir="ltr">{f.name}</span>
                      <a href={f.url} className="text-primary inline-flex items-center gap-1"><Download className="w-3.5 h-3.5" /></a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {data.allowSubmit && (
          <div className="grid lg:grid-cols-2 gap-8 pt-4 border-t border-border">
            <div className="space-y-6">
              <Revision base={base} t={t} onDone={loadDesign} />
              {data.submissions.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl mb-3">{t.yourRevisions}</h2>
                  <ul className="space-y-3">
                    {data.submissions.map((v) => (
                      <li key={v.number} className="border border-border bg-card p-4 flex gap-4">
                        {v.images[0] && <img src={v.images[0]} alt="" draggable={false} className="w-24 h-20 object-cover border border-border" />}
                        <div className="text-sm space-y-1 min-w-0">
                          <p className="font-semibold" dir="ltr">v{v.number} · <span className="font-normal text-foreground/60">{fmtDate(v.createdAt)}</span></p>
                          <p className={v.status === "rejected" ? "text-red-700" : v.status === "proposed" ? "text-[#c08b3d]" : "text-[#524727]"}>{t.vs[v.status] ?? v.status}</p>
                          {v.note && <p className="text-foreground/70">{v.note}</p>}
                          {v.decisionNote && <p className="text-xs text-foreground/60">↳ Butter: {v.decisionNote}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Discussion base={base} t={t} comments={data.comments} onDone={loadDesign} />
          </div>
        )}
        {d.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {d.images.map((u) => (
              <div key={u} className="relative border border-border/60 bg-muted/30">
                <img src={u} alt="" draggable={false} loading="lazy" className="w-full h-auto select-none" />
                <span className="absolute bottom-2 end-2 text-[0.6rem] text-foreground/40 bg-background/70 px-1.5 pointer-events-none">{data.recipient}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
