import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import { useParams } from "wouter";
import { Lock } from "lucide-react";
import logoBb from "@/assets/real/logo-bb.jpg";
import { Button } from "@/components/ui/button";
import { fmtDate } from "./api";
import { useStaffText } from "./i18n";
import { useNoIndex } from "./StaffShell";
import type { Model3D } from "./Design3D";

const Design3D = lazy(() => import("./Design3D").then((m) => ({ default: m.Design3D })));

interface Shared {
  recipient: string;
  expiresAt: string;
  design: {
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
  },
};

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
    <header className="border-b border-border/60">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <span className="flex items-center gap-3">
          <span className="w-9 h-9 overflow-hidden rounded-sm ring-1 ring-border">
            <img src={logoBb} alt="Butter" className="w-full h-full object-cover" />
          </span>
          <span className="font-serif text-base font-bold tracking-wider">BUTTER</span>
        </span>
        <button onClick={toggleLang} className="text-xs tracking-widest px-3 py-2 border border-border text-foreground/60 hover:border-primary hover:text-primary">
          {lang === "en" ? "عربي" : "EN"}
        </button>
      </div>
    </header>
  );

  if (state !== "open" || !data) {
    const closed = state === "expired" || state === "used_up" || state === "revoked" || state === "not_found";
    return (
      <div className="min-h-screen bg-background text-foreground">
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
    <div className="min-h-screen bg-background text-foreground" onContextMenu={(e) => e.preventDefault()}>
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
          </div>
        </div>
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
