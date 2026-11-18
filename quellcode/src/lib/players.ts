import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT, type Progress, setProgress } from "@/lib/store";

const KEY = "kommaheld-progress-v1";
const makeKey = (id: string) => `${KEY}:${id}`;

export async function activatePlayer(userId: string) {
  try {
    const local = JSON.parse(localStorage.getItem(makeKey(userId)) || "null") as Progress | null;
    const { data } = await supabase.from("player_progress").select("progress").eq("user_id", userId).maybeSingle();
    const cloud = data?.progress as Progress | undefined;
    const progress = cloud ? { ...DEFAULT, ...cloud } : local ? { ...DEFAULT, ...local } : DEFAULT;
    localStorage.setItem(makeKey(userId), JSON.stringify(progress));
    setProgress(() => progress);
    if (!cloud) await supabase.from("player_progress").upsert({ user_id: userId, progress });
  } catch (error) {
    console.error("Could not load player progress", error);
  }
}

export function useRealPlayers() {
  const [players, setPlayers] = useState<{ id: string; name: string; avatar: string | null; xp: number; weeklyXp: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data, error: queryError } = await supabase.from("player_profiles").select("user_id,display_name,avatar_url,player_progress(progress)").order("created_at", { ascending: true });
      if (!alive) return;
      if (queryError) setError(queryError.message);
      else setPlayers((data ?? []).map((row) => {
        const raw = row.player_progress as unknown as { progress?: Progress } | { progress?: Progress }[] | null;
        const record = Array.isArray(raw) ? raw[0]?.progress : raw?.progress;
        const p = record ?? DEFAULT;
        return { id: row.user_id, name: row.display_name, avatar: row.avatar_url, xp: p.xp ?? 0, weeklyXp: p.weeklyXp ?? 0 };
      }).sort((a, b) => b.weeklyXp - a.weeklyXp));
      setLoading(false);
    };
    void load();
    const channel = supabase.channel("leaderboard-live").on("postgres_changes", { event: "*", schema: "public", table: "player_progress" }, () => void load()).subscribe();
    return () => { alive = false; void supabase.removeChannel(channel); };
  }, []);
  return { players, loading, error };
}
