import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import logoBb from "@/assets/real/logo-bb.jpg";
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

/** Keeps search engines away from every staff page. */
export function useNoIndex() {
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
}

export function StaffShell({ me, children }: { me?: Me | null; children: ReactNode }) {
  const { s, lang, toggleLang } = useStaffText();
  const [loc, navigate] = useLocation();
  const qc = useQueryClient();
  useNoIndex();

  const signOut = async () => {
    await api("/logout", { method: "POST" }).catch(() => undefined);
    qc.setQueryData(["staff-me"], null);
    navigate("/staff");
  };

  const tab = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm tracking-wide px-1 py-1 border-b-2 transition-colors ${
        loc === href ? "border-primary text-primary" : "border-transparent text-foreground/60 hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/95 sticky top-0 z-40 backdrop-blur">
        <div className="container mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <span className="w-9 h-9 overflow-hidden rounded-sm ring-1 ring-border">
              <img src={logoBb} alt="Butter" className="w-full h-full object-cover" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-base font-bold tracking-wider">BUTTER</span>
              <span className="text-[0.55rem] uppercase tracking-[0.3em] text-primary mt-1">{s.portal}</span>
            </span>
          </Link>
          {me && (
            <nav className="flex items-center gap-5">
              {tab("/staff/library", s.brandLibrary)}
              {me.user.isAdmin && tab("/staff/admin", s.admin)}
            </nav>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleLang}
              className="text-xs tracking-widest px-3 py-2 border border-border text-foreground/60 hover:border-primary hover:text-primary"
            >
              {lang === "en" ? "عربي" : "EN"}
            </button>
            {me && (
              <button onClick={signOut} className="text-xs tracking-wide px-3 py-2 text-foreground/60 hover:text-primary">
                {s.signOut}
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-5 md:px-10 py-8 md:py-12">{children}</main>
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
    else if (adminOnly && !me.data.user.isAdmin) navigate("/staff/library");
  }, [me.isLoading, me.data, adminOnly, navigate]);
  return me;
}
