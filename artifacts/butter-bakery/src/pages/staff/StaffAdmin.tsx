import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError, fmtDate, fmtSize, type Access, type AdminSection, type LogRow, type StaffUser } from "./api";
import { useStaffText } from "./i18n";
import { StaffShell, useRequireMe } from "./StaffShell";
import { TIER_DOT } from "./StaffLibrary";
import { StaffDesigns } from "./StaffDesigns";

type Presets = Record<"partner" | "agency" | "management", Record<string, Access>>;
interface Draft {
  id?: number;
  username: string;
  displayName: string;
  password: string;
  isAdmin: boolean;
  active: boolean;
  expiresAt: string; // yyyy-mm-dd or ""
  note: string;
  permissions: Record<string, Access>;
}

const LEVELS: Access[] = ["none", "view", "download"];

function randomPassword() {
  const abc = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const a = new Uint32Array(14);
  crypto.getRandomValues(a);
  return Array.from(a, (n) => abc[n % abc.length]).join("");
}

const isExpired = (u: StaffUser) => !!u.expiresAt && new Date(u.expiresAt).getTime() < Date.now();

export default function StaffAdmin() {
  const { s, isAr } = useStaffText();
  const me = useRequireMe(true);
  const qc = useQueryClient();
  const [tab, setTab] = useState<"users" | "designs" | "log" | "library">("users");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const ok = !!me.data?.user.isAdmin;
  const meta = useQuery({ queryKey: ["staff-meta"], queryFn: () => api<{ sections: AdminSection[]; presets: Presets }>("/admin/meta"), enabled: ok });
  const users = useQuery({ queryKey: ["staff-users"], queryFn: () => api<{ users: StaffUser[] }>("/admin/users"), enabled: ok });
  const log = useQuery({ queryKey: ["staff-log"], queryFn: () => api<{ log: LogRow[] }>("/admin/log?limit=300"), enabled: ok && tab === "log" });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const body = {
        displayName: d.displayName,
        isAdmin: d.isAdmin,
        active: d.active,
        expiresAt: d.expiresAt ? new Date(d.expiresAt + "T23:59:59").toISOString() : null,
        note: d.note,
        permissions: d.permissions,
        ...(d.password ? { password: d.password } : {}),
      };
      return d.id
        ? api(`/admin/users/${d.id}`, { method: "PATCH", body })
        : api("/admin/users", { method: "POST", body: { ...body, username: d.username } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-users"] });
      setDraft(null);
      setError("");
      setFlash(s.saved);
      setTimeout(() => setFlash(""), 2500);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : String(e)),
  });

  if (!ok) return <StaffShell me={me.data}>{null}</StaffShell>;
  const sections = meta.data?.sections ?? [];
  const presets = meta.data?.presets;

  const startNew = () => {
    setError("");
    setDraft({
      username: "",
      displayName: "",
      password: randomPassword(),
      isAdmin: false,
      active: true,
      expiresAt: "",
      note: "",
      permissions: presets?.partner ?? {},
    });
  };
  const startEdit = (u: StaffUser) => {
    setError("");
    setDraft({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      password: "",
      isAdmin: u.isAdmin,
      active: u.active,
      expiresAt: u.expiresAt ? u.expiresAt.slice(0, 10) : "",
      note: u.note ?? "",
      permissions: u.permissions,
    });
  };

  const tabBtn = (id: typeof tab, label: string) => (
    <button onClick={() => setTab(id)} className={`text-sm px-1 pb-2 border-b-2 whitespace-nowrap ${tab === id ? "border-primary text-primary" : "border-transparent text-foreground/60"}`}>
      {label}
    </button>
  );

  return (
    <StaffShell me={me.data}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <h1 className="font-serif text-3xl md:text-4xl">{s.admin}</h1>
        {flash && <span className="text-sm text-emerald-700">{flash}</span>}
      </div>
      <div className="flex gap-6 border-b border-border/60 mb-8 overflow-x-auto">
        {tabBtn("users", s.users)}
        {tabBtn("designs", s.designs)}
        {tabBtn("log", s.log)}
        {tabBtn("library", s.library)}
      </div>

      {tab === "users" && (
        <div className="space-y-8">
          {!draft && <Button onClick={startNew}>+ {s.newUser}</Button>}

          {draft && (
            <form
              className="border border-border bg-card p-5 md:p-7 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(draft);
              }}
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>{s.username}</Label>
                  <Input dir="ltr" value={draft.username} disabled={!!draft.id} required pattern="[a-z0-9._\-]{3,40}" onChange={(e) => setDraft({ ...draft, username: e.target.value.toLowerCase() })} />
                </div>
                <div className="space-y-2">
                  <Label>{s.name}</Label>
                  <Input value={draft.displayName} required onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{draft.id ? s.newPassword : s.password}</Label>
                  <div className="flex gap-2">
                    <Input dir="ltr" value={draft.password} required={!draft.id} minLength={10} onChange={(e) => setDraft({ ...draft, password: e.target.value })} className="font-mono" />
                    <Button type="button" variant="outline" onClick={() => setDraft({ ...draft, password: randomPassword() })}>
                      {s.generate}
                    </Button>
                  </div>
                  <p className="text-xs text-foreground/50">{s.passwordHint}</p>
                </div>
                <div className="space-y-2">
                  <Label>{s.expires}</Label>
                  <Input type="date" dir="ltr" value={draft.expiresAt} onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })} />
                  <p className="text-xs text-foreground/50">{draft.expiresAt ? "" : s.never}</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{s.note}</Label>
                  <Input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> {s.active}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={draft.isAdmin} onChange={(e) => setDraft({ ...draft, isAdmin: e.target.checked })} /> {s.isAdmin}
                </label>
              </div>

              {!draft.isAdmin && (
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-sm font-medium me-2">{s.access}</span>
                    <span className="text-xs text-foreground/50">{s.presets}:</span>
                    {presets &&
                      (Object.keys(presets) as (keyof Presets)[]).map((k) => (
                        <button key={k} type="button" onClick={() => setDraft({ ...draft, permissions: { ...presets[k] } })} className="text-xs border border-border px-2.5 py-1 hover:border-primary">
                          {s.preset[k]}
                        </button>
                      ))}
                  </div>
                  <div className="divide-y divide-border/60 border border-border/60">
                    {sections.map((sec) => (
                      <div key={sec.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                        <span className="text-sm flex-1 min-w-[12rem]">
                          {TIER_DOT[sec.tier]} {isAr ? sec.ar : sec.en}
                        </span>
                        <div className="flex border border-border">
                          {LEVELS.map((lv) => (
                            <button
                              key={lv}
                              type="button"
                              onClick={() => setDraft({ ...draft, permissions: { ...draft.permissions, [sec.id]: lv } })}
                              className={`text-xs px-3 py-1.5 ${
                                (draft.permissions[sec.id] ?? "none") === lv ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:bg-muted"
                              }`}
                            >
                              {s.level[lv]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button type="submit" disabled={save.isPending}>{s.save}</Button>
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>{s.cancel}</Button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-foreground/60 text-xs">
                <tr>
                  <th className="text-start p-3">{s.name}</th>
                  <th className="text-start p-3">{s.role}</th>
                  <th className="text-start p-3">{s.status}</th>
                  <th className="text-start p-3">{s.expires}</th>
                  <th className="text-start p-3">{s.lastLogin}</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(users.data?.users ?? []).map((u) => (
                  <tr key={u.id}>
                    <td className="p-3">
                      <div className="font-medium">{u.displayName}</div>
                      <div className="text-xs text-foreground/50" dir="ltr">{u.username}{u.note ? ` · ${u.note}` : ""}</div>
                    </td>
                    <td className="p-3">{u.isAdmin ? s.adminRole : s.staff}</td>
                    <td className="p-3">
                      {!u.active ? <span className="text-red-700">{s.inactive}</span> : isExpired(u) ? <span className="text-amber-700">{s.expired}</span> : <span className="text-emerald-700">{s.active}</span>}
                    </td>
                    <td className="p-3 text-xs" dir="ltr">{u.expiresAt ? fmtDate(u.expiresAt) : "—"}</td>
                    <td className="p-3 text-xs" dir="ltr">{fmtDate(u.lastLoginAt)}</td>
                    <td className="p-3 text-end">
                      <button onClick={() => startEdit(u)} className="text-xs text-primary hover:underline">{s.edit}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "designs" && <StaffDesigns />}

      {tab === "log" && (
        <div className="overflow-x-auto border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-foreground/60 text-xs">
              <tr>
                <th className="text-start p-3">{s.when}</th>
                <th className="text-start p-3">{s.who}</th>
                <th className="text-start p-3">{s.what}</th>
                <th className="text-start p-3">{s.file}</th>
                <th className="text-start p-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(log.data?.log ?? []).map((r) => (
                <tr key={r.id} className={r.action === "login_failed" ? "bg-red-50/60" : r.action === "download" ? "bg-amber-50/40" : ""}>
                  <td className="p-3 text-xs whitespace-nowrap" dir="ltr">{fmtDate(r.at)}</td>
                  <td className="p-3 text-xs" dir="ltr">{r.username ?? "—"}</td>
                  <td className="p-3 text-xs">{s.actions[r.action] ?? r.action}</td>
                  <td className="p-3 text-xs break-all" dir="ltr">{r.path ?? r.detail ?? ""}</td>
                  <td className="p-3 text-xs text-foreground/50" dir="ltr">{r.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "library" && (
        <div className="space-y-6">
        <div className="border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-medium">{s.uploadTitle}</p>
          <p className="text-xs text-foreground/60">{s.uploadHint}</p>
          <input
            type="file"
            accept=".zip,application/zip"
            disabled={uploading}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setUploading(true);
              setUploadMsg("");
              try {
                const r = await fetch("/api/staff/admin/import", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/zip" }, body: f });
                const d = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(d.message || d.error || String(r.status));
                setUploadMsg(`${f.name}: +${d.added} · ${d.updated} ↻ · ${d.unchanged} =`);
                qc.invalidateQueries({ queryKey: ["staff-meta"] });
                qc.invalidateQueries({ queryKey: ["staff-files"] });
              } catch (err) {
                setUploadMsg(`${s.failed} ${err instanceof Error ? err.message : ""}`);
              } finally {
                setUploading(false);
              }
            }}
            className="block text-sm"
          />
          {uploading && <p className="text-xs text-foreground/60">{s.uploading}</p>}
          {uploadMsg && <p className="text-xs" dir="ltr">{uploadMsg}</p>}
        </div>
        <div className="divide-y divide-border/60 border border-border/60">
          {sections.map((sec) => (
            <div key={sec.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
              <span className="flex-1 min-w-[12rem]">{TIER_DOT[sec.tier]} {isAr ? sec.ar : sec.en}</span>
              <span className="text-xs text-foreground/60" dir="ltr">{sec.files} · {fmtSize(sec.bytes)}</span>
            </div>
          ))}
          {sections.every((x) => x.files === 0) && <p className="p-4 text-sm text-foreground/60">{s.emptyLibrary}</p>}
        </div>
        </div>
      )}
    </StaffShell>
  );
}
