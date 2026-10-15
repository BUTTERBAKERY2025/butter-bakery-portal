import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "./api";
import { useStaffText } from "./i18n";
import { StaffShell, useMe, type Me } from "./StaffShell";

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
    if (me.data) navigate("/staff/library");
  }, [me.data, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api<Me>("/login", { method: "POST", body: { username, password } });
      qc.setQueryData(["staff-me"], data);
      navigate("/staff/library");
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
      <div className="max-w-sm mx-auto pt-6 md:pt-16">
        <p className="text-primary text-xs uppercase tracking-[0.3em] mb-3">Staff only</p>
        <h1 className="font-serif text-3xl md:text-4xl mb-3">{s.loginTitle}</h1>
        <p className="text-foreground/60 text-sm leading-relaxed mb-8">{s.loginSub}</p>
        <form onSubmit={submit} className="space-y-5">
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
        </form>
        <Link href="/" className="inline-block mt-8 text-xs text-foreground/50 hover:text-primary">
          ← {s.back}
        </Link>
      </div>
    </StaffShell>
  );
}
