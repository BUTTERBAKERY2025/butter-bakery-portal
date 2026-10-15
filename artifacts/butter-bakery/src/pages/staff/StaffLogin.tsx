import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "./api";
import { useStaffText } from "./i18n";
import { StaffShell, useMe, type Me } from "./StaffShell";

const landing = (_m: Me) => "/staff/home";

export default function StaffLogin() {
  const { s } = useStaffText();
  const me = useMe();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (me.data) navigate(landing(me.data));
  }, [me.data, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api<Me>("/login", { method: "POST", body: { username, password } });
      qc.setQueryData(["staff-me"], data);
      navigate(landing(data));
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "";
      setError(
        code === "wrong_credentials" ? s.wrong : code === "account_disabled" ? s.disabled : code === "too_many_attempts" ? s.tooMany : s.failed,
      );
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <StaffShell>
      <div className="grid md:grid-cols-2 min-h-[calc(100vh-10rem)] bb-card overflow-hidden">
        <div className="relative bg-[var(--bb-brown)] text-[var(--bb-cream)] p-8 md:p-14 flex flex-col justify-between min-h-[260px]">
          <img src="/staff/logo-icon-cream.svg" alt="" className="w-40 md:w-56 opacity-95" />
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-[var(--bb-orange)] mb-3">Roastery · Bakery</p>
            <p className="font-serif text-3xl md:text-4xl leading-tight">{s.loginTitle}</p>
            <p className="text-sm text-[var(--bb-cream)]/60 mt-3 max-w-sm leading-relaxed">{s.loginSub}</p>
          </div>
          <div className="absolute inset-y-0 end-0 w-1.5 bg-[var(--bb-orange)]" />
        </div>
        <div className="p-8 md:p-14 flex items-center">
          <form onSubmit={submit} className="space-y-5 w-full max-w-sm mx-auto">
            <p className="bb-eyebrow">Staff only</p>
            <h1 className="font-serif text-3xl mb-2">{s.signIn}</h1>
            <div className="space-y-2">
              <Label htmlFor="u">{s.username}</Label>
              <Input id="u" dir="ltr" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">{s.password}</Label>
              <Input id="p" dir="ltr" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {s.signIn}
            </Button>
            <Link href="/" className="inline-block pt-4 text-xs text-foreground/50 hover:text-primary">
              ← {s.back}
            </Link>
          </form>
        </div>
      </div>
    </StaffShell>
  );
}
