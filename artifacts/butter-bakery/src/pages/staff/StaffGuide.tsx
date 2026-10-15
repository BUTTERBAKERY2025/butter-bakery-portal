import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Maximize2, ExternalLink } from "lucide-react";
import { useStaffText } from "./i18n";
import { StaffShell, useRequireMe } from "./StaffShell";

/** The interactive identity guide, presented inside the portal. */
export default function StaffGuide() {
  const { s } = useStaffText();
  const me = useRequireMe();
  const [, navigate] = useLocation();
  const frame = useRef<HTMLIFrameElement>(null);
  const allowed = me.data?.sections.some((x) => x.id === "guide-online" && x.access !== "none");

  useEffect(() => {
    if (me.data && !allowed) navigate("/staff/library");
  }, [me.data, allowed, navigate]);

  // Fit the guide to the space under the portal header (taller on phones, where the menu wraps).
  useEffect(() => {
    const set = () => {
      const h = document.querySelector("header")?.getBoundingClientRect().height ?? 64;
      document.documentElement.style.setProperty("--staff-head", `${Math.round(h)}px`);
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [me.data]);

  // Uses the guide's own presentation mode (slide by slide, full screen), same as the original page.
  const present = () => {
    const btn = frame.current?.contentDocument?.getElementById("presBtn") as HTMLButtonElement | null;
    if (btn) btn.click();
    else if (frame.current?.requestFullscreen) void frame.current.requestFullscreen();
    else window.open("/api/staff/guide/", "_blank");
  };

  if (!me.data || !allowed) return <StaffShell me={me.data}>{null}</StaffShell>;

  return (
    <StaffShell me={me.data} wide>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 md:px-10 py-3 border-b border-border/60">
        <h1 className="font-serif text-xl md:text-2xl">{s.guideTitle}</h1>
        <div className="flex gap-2">
          <button onClick={present} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90">
            <Maximize2 className="w-4 h-4" /> {s.present}
          </button>
          <a href="/api/staff/guide/" target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm text-foreground/70 hover:text-primary">
            <ExternalLink className="w-4 h-4" /> <span className="hidden sm:inline">{s.newTab}</span>
          </a>
        </div>
      </div>
      <iframe
        ref={frame}
        src="/api/staff/guide/"
        title={s.guideTitle}
        allow="fullscreen"
        allowFullScreen
        className="block w-full border-0 bg-[#f6efe2]"
        style={{ height: "calc(100dvh - var(--staff-head, 64px) - 61px)" }}
      />
    </StaffShell>
  );
}
