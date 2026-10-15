import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink, FileText, Lock } from "lucide-react";
import { api, fileUrl, fmtSize, type BrandFile, type Tier } from "./api";
import { useStaffText } from "./i18n";
import { StaffShell, useRequireMe } from "./StaffShell";

export const TIER_STYLE: Record<Tier, string> = {
  green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  yellow: "bg-amber-50 text-amber-800 border-amber-200",
  red: "bg-red-50 text-red-800 border-red-200",
};
export const TIER_DOT: Record<Tier, string> = { green: "🟢", yellow: "🟡", red: "🔴" };

const isImage = (m: string) => m.startsWith("image/");

export default function StaffLibrary() {
  const { s, isAr } = useStaffText();
  const me = useRequireMe();
  const files = useQuery({
    queryKey: ["staff-files"],
    queryFn: () => api<{ files: BrandFile[] }>("/files"),
    enabled: !!me.data,
  });

  const bySection = useMemo(() => {
    const m = new Map<string, BrandFile[]>();
    for (const f of files.data?.files ?? []) m.set(f.section, [...(m.get(f.section) ?? []), f]);
    return m;
  }, [files.data]);

  if (!me.data) return <StaffShell>{null}</StaffShell>;
  const sections = me.data.sections.filter((x) => x.access !== "none");

  return (
    <StaffShell me={me.data}>
      <div className="mb-10">
        <p className="text-primary text-xs uppercase tracking-[0.3em] mb-2">
          {s.hello}{isAr ? "، " : ", "}{me.data.user.displayName}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl mb-3">{s.brandLibrary}</h1>
        <p className="text-sm text-foreground/60 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0" /> {s.confidential}
        </p>
      </div>

      {!sections.length && <p className="text-foreground/60">{s.noAccess}</p>}
      {sections.length > 1 && (
        <nav className="flex flex-wrap gap-2 mb-10">
          {sections.map((sec) => (
            <a key={sec.id} href={`#${sec.id}`} className="text-xs border border-border px-3 py-1.5 hover:border-primary hover:text-primary">
              {TIER_DOT[sec.tier]} {isAr ? sec.ar : sec.en}{sec.id !== "guide-online" && <span className="text-foreground/40" dir="ltr"> · {bySection.get(sec.id)?.length ?? 0}</span>}
            </a>
          ))}
        </nav>
      )}

      <div className="space-y-12">
        {sections.map((sec) => {
          const list = bySection.get(sec.id) ?? [];
          return (
            <section key={sec.id} id={sec.id} className="scroll-mt-24">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-4 border-b border-border/60 pb-3">
                <h2 className="font-serif text-xl md:text-2xl">{isAr ? sec.ar : sec.en}</h2>
                <span className={`text-[0.7rem] px-2 py-0.5 border rounded-full ${TIER_STYLE[sec.tier]}`}>
                  {TIER_DOT[sec.tier]} {s.tier[sec.tier]}
                </span>
                {sec.access === "view" && (
                  <span className="text-[0.7rem] px-2 py-0.5 border border-border rounded-full text-foreground/60">{s.viewOnly}</span>
                )}
                {sec.id !== "guide-online" && (
                  <span className="text-xs text-foreground/50 ms-auto">
                    {list.length} {s.files}
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/60 mb-5">{isAr ? sec.descAr : sec.descEn}</p>
              {sec.id === "guide-online" ? (
                <Link href="/staff/guide" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-sm hover:opacity-90">
                  <ExternalLink className="w-4 h-4" /> {s.openGuide}
                </Link>
              ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {list.map((f) => {
                  const name = f.path.split("/").pop()!;
                  const folder = f.path.split("/").slice(1, -1).join(" / ");
                  return (
                    <li key={f.id} className="border border-border/70 bg-card rounded-sm overflow-hidden flex flex-col min-w-0">
                      <div className="aspect-[4/3] bg-muted/40 flex items-center justify-center overflow-hidden">
                        {isImage(f.mime) ? (
                          <img src={fileUrl(f.id, "view", true)} alt="" loading="lazy" className="max-w-full max-h-full object-contain p-2" />
                        ) : (
                          <FileText className="w-8 h-8 text-foreground/30" />
                        )}
                      </div>
                      <div className="p-3 flex flex-col gap-2 flex-1 min-w-0">
                        <p className="text-xs font-medium break-all leading-snug" dir="ltr">{name}</p>
                        <p className="text-[0.65rem] text-foreground/50" dir="ltr">
                          {folder ? `${folder} · ` : ""}
                          {fmtSize(f.size)}
                        </p>
                        <div className="mt-auto flex gap-2 pt-1">
                          <a href={fileUrl(f.id, "view")} target="_blank" rel="noopener" className="text-xs inline-flex items-center gap-1 text-foreground/70 hover:text-primary">
                            <ExternalLink className="w-3.5 h-3.5" /> {s.view}
                          </a>
                          {f.canDownload && (
                            <a href={fileUrl(f.id, "download")} className="text-xs inline-flex items-center gap-1 text-primary hover:underline ms-auto">
                              <Download className="w-3.5 h-3.5" /> {s.download}
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              )}
            </section>
          );
        })}
      </div>
    </StaffShell>
  );
}
