import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, type Section, type StaffUser } from "./api";
import { useStaffText } from "./i18n";

export interface Me {
  user: StaffUser;
  sections: Section[];
}

export function useMe() {
  return useQuery<Me | null>({
    queryKey: ["staff-me"],
    queryFn: async () => {
      try {
        return await api<Me>("/me");
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}

/** Keeps search engines away from every staff page, and loads the identity fonts once. */
export function useNoIndex() {
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    if (!document.getElementById("bb-fonts")) {
      const l = document.createElement("link");
      l.id = "bb-fonts";
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Lato:wght@300;400;700&family=Readex+Pro:wght@300;400;500;600&display=swap";
      document.head.appendChild(l);
    }
    return () => m.remove();
  }, []);
}

export const canSeeGuide = (me: Me) => me.sections.some((x) => x.id === "guide-online" && x.access !== "none");

export function StaffShell({ me, children, wide = false }: { me?: Me | null; children: ReactNode; wide?: boolean }) {
  const { s, lang, toggleLang } = useStaffText();
  const [loc, navigate] = useLocation();
  const qc = useQueryClient();
  useNoIndex();

  const signOut = async () => {
    await api("/logout", { method: "POST" }).catch(() => undefined);
    qc.setQueryData(["staff-me"], null);
    navigate("/staff");
  };

  const tab = (href: string, label: string) => {
    const on = loc === href || (href !== "/staff/home" && loc.startsWith(href));
    return (
      <Link
        href={href}
        className={`relative text-[0.82rem] tracking-wide py-2 whitespace-nowrap transition-colors ${on ? "text-[var(--bb-cream)]" : "text-[var(--bb-cream)]/55 hover:text-[var(--bb-cream)]"}`}
      >
        {label}
        {on && <span className="absolute -bottom-px inset-x-0 h-0.5 bg-[var(--bb-orange)]" />}
      </Link>
    );
  };

  return (
    <div className="staff-theme min-h-screen">
      <header className="sticky top-0 z-40 bg-[var(--bb-brown)] text-[var(--bb-cream)]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 min-h-16 py-2 md:py-0 md:h-16 flex flex-wrap md:flex-nowrap items-center justify-between gap-x-6 gap-y-1">
          <Link href={me ? "/staff/home" : "/staff"} className="flex items-center gap-3 shrink-0">
            <img src="/staff/logo-icon-cream.svg" alt="Butter" className="h-6 w-auto" />
            <span className="h-5 w-px bg-[var(--bb-cream)]/25" />
            <span className="text-[0.62rem] uppercase tracking-[0.32em] text-[var(--bb-cream)]/70">{s.portal}</span>
          </Link>
          {me && (
            <nav className="order-last md:order-none w-full md:w-auto flex items-center gap-6 overflow-x-auto md:me-auto">
              {tab("/staff/home", s.home)}
              {canSeeGuide(me) && tab("/staff/guide", s.guideTab)}
              {tab("/staff/library", s.brandLibrary)}
              {me.user.isAdmin && tab("/staff/designs", s.designs)}
              {me.user.isAdmin && tab("/staff/admin", s.admin)}
            </nav>
          )}
          <div className="flex items-center gap-2 shrink-0">
            {me && <span className="hidden lg:inline text-xs text-[var(--bb-cream)]/50 me-2">{me.user.displayName}</span>}
            <button
              onClick={toggleLang}
              className="text-xs tracking-widest px-3 py-1.5 border border-[var(--bb-cream)]/25 text-[var(--bb-cream)]/80 hover:border-[var(--bb-orange)] hover:text-[var(--bb-cream)]"
            >
              {lang === "en" ? "عربي" : "EN"}
            </button>
            {me && (
              <button onClick={signOut} className="text-xs tracking-wide px-2 py-1.5 text-[var(--bb-cream)]/60 hover:text-[var(--bb-orange)]">
                {s.signOut}
              </button>
            )}
          </div>
        </div>
      </header>
      {wide ? <main>{children}</main> : <main className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-12">{children}</main>}
    </div>
  );
}

/** Redirects to the sign-in page when there is no session. */
export function useRequireMe(adminOnly = false) {
  const me = useMe();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (me.isLoading) return;
    if (!me.data) navigate("/staff");
    else if (adminOnly && !me.data.user.isAdmin) navigate("/staff/home");
  }, [me.isLoading, me.data, adminOnly, navigate]);
  return me;
}
