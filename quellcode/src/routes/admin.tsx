import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Trash2, RotateCcw, Server } from "lucide-react";
import { Card, Btn } from "@/components/ui3d";
import { supabase } from "@/lib/supabase";
import { useRealPlayers } from "@/lib/players";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin / Owner – Kommaheld" }] }),
  component: Admin,
});

type Stats = { profiles: number; progress_records: number; last_sync: string | null; database: string; server_time: string };
function Admin() {
  const [userId, setUserId] = useState<string | null>(null);
  const [owner, setOwner] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [message, setMessage] = useState("");
  const { players, loading, error } = useRealPlayers();
  useEffect(() => { void supabase.auth.getUser().then(async ({ data }) => {
    const user = data.user;
    setUserId(user?.id ?? null);
    const isOwner = user?.app_metadata?.role === "owner";
    setOwner(isOwner);
    if (isOwner) {
      const { data: result, error: rpcError } = await supabase.rpc("owner_server_overview");
      if (rpcError) setMessage(rpcError.message); else setStats(result as Stats);
    }
  }); }, []);
  const run = async (label: string, operation: () => Promise<{ error: { message: string } | null }>) => {
    if (!window.confirm(label)) return;
    const { error: actionError } = await operation();
    setMessage(actionError?.message ?? "Aktion erfolgreich ausgeführt.");
    if (!actionError) location.reload();
  };
  if (!owner) return <Card className="mx-auto max-w-lg text-center"><Lock className="mx-auto" /><h1 className="mt-3 text-2xl font-bold">Admin / Owner</h1><p className="mt-2 text-muted-foreground">Dieser Bereich ist nur für das serverseitig bestätigte Owner-Konto verfügbar.</p>{userId ? <p className="mt-2 text-sm">Deinem Konto fehlt die Owner-Rolle in Supabase app_metadata.</p> : <p className="mt-2">Bitte melde dich zuerst an.</p>}</Card>;
  return <div className="space-y-5"><div><h1 className="text-3xl font-bold">Admin / Owner</h1><p className="text-muted-foreground">Spielerverwaltung und sichere Datenbankübersicht.</p></div>
    {stats && <Card><h2 className="flex items-center gap-2 text-xl font-bold"><Server /> Datenserver</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><p>Spielerprofile: <b>{stats.profiles}</b></p><p>Fortschrittsdatensätze: <b>{stats.progress_records}</b></p><p>Letzte Synchronisierung: <b>{stats.last_sync ? new Date(stats.last_sync).toLocaleString("de-DE") : "Noch keine"}</b></p><p>Serverzeit: <b>{new Date(stats.server_time).toLocaleString("de-DE")}</b></p><p>Datenbank: <b>{stats.database}</b></p></div><p className="mt-3 text-xs text-muted-foreground">Aus Sicherheitsgründen zeigt diese Seite keine Passwörter, API-Secret-Keys oder vertraulichen Servervariablen.</p></Card>}
    {message && <p role="status" className="rounded-xl bg-accent p-3">{message}</p>}{error && <p className="text-destructive">{error}</p>}
    <Card className="overflow-x-auto p-0"><table className="w-full min-w-[700px] text-sm"><thead><tr className="border-b text-left"><th className="p-3">Spieler</th><th>XP</th><th>Wochen-XP</th><th>Aktionen</th></tr></thead><tbody>{loading ? <tr><td className="p-3" colSpan={4}>Lädt …</td></tr> : players.map((player) => <tr key={player.id} className="border-b"><td className="p-3 font-bold">{player.name}</td><td>{player.xp}</td><td>{player.weeklyXp}</td><td className="flex gap-2 py-2"><Btn variant="ghost" className="py-2" onClick={() => void run(`${player.name}: Fortschritt zurücksetzen?`, () => supabase.rpc("owner_reset_player", { target_user: player.id, reset_profile: false }))}><RotateCcw size={15} /> Zurücksetzen</Btn><Btn variant="danger" className="py-2" onClick={() => void run(`${player.name}: Konto und alle Daten endgültig löschen?`, () => supabase.rpc("owner_delete_player", { target_user: player.id }))}><Trash2 size={15} /> Löschen</Btn></td></tr>)}</tbody></table></Card>
  </div>;
}
