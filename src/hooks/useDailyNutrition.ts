import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { computeMacroTargets, todayISO } from "@/lib/macros";

export type NutritionTotals = {
  calories: number; protein: number; carbs: number; fat: number; fiber: number;
};
export type Goals = {
  calories: number; protein: number; carbs: number; fat: number; fiber: number; water: number;
};

const EMPTY: NutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
const DEFAULT_GOALS: Goals = { calories: 2200, protein: 130, carbs: 250, fat: 70, fiber: 30, water: 3500 };

/** Real-time shared source of truth for today's nutrition + water. */
export function useDailyNutrition() {
  const [userId, setUserId] = useState<string | null>(null);
  const [date] = useState<string>(todayISO());
  const [totals, setTotals] = useState<NutritionTotals>(EMPTY);
  const [waterMl, setWaterMl] = useState<number>(0);
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [profile, setProfile] = useState<any>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async (uid: string) => {
    const [{ data: entries }, { data: waters }, { data: g }, { data: p }] = await Promise.all([
      supabase.from("diary_entries").select("calories,protein,carbs,fat,fiber").eq("user_id", uid).eq("entry_date", date),
      supabase.from("water_logs").select("amount_ml").eq("user_id", uid).eq("log_date", date),
      supabase.from("nutrition_goals").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
    ]);
    const t = (entries || []).reduce<NutritionTotals>((a, e: any) => ({
      calories: a.calories + Number(e.calories || 0),
      protein: a.protein + Number(e.protein || 0),
      carbs: a.carbs + Number(e.carbs || 0),
      fat: a.fat + Number(e.fat || 0),
      fiber: a.fiber + Number(e.fiber || 0),
    }), EMPTY);
    setTotals(t);
    setWaterMl((waters || []).reduce((s: number, w: any) => s + Number(w.amount_ml || 0), 0));
    setProfile(p || null);
    if (g) {
      setGoals({
        calories: Number(g.calorie_goal), protein: Number(g.protein_goal),
        carbs: Number(g.carb_goal), fat: Number(g.fat_goal), fiber: Number(g.fiber_goal),
        water: Number(g.water_goal_ml || 3500),
      });
    } else if (p) {
      const auto = computeMacroTargets(p);
      setGoals({ ...auto, water: 3500 });
    }
    setReady(true);
  }, [date]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || !alive) return;
      setUserId(data.user.id);
      await refresh(data.user.id);
    })();
    return () => { alive = false; };
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`daily-nutrition-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "diary_entries", filter: `user_id=eq.${userId}` }, () => refresh(userId))
      .on("postgres_changes", { event: "*", schema: "public", table: "water_logs", filter: `user_id=eq.${userId}` }, () => refresh(userId))
      .on("postgres_changes", { event: "*", schema: "public", table: "nutrition_goals", filter: `user_id=eq.${userId}` }, () => refresh(userId))
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${userId}` }, () => refresh(userId))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, refresh]);

  const addWater = useCallback(async (ml: number) => {
    if (!userId || !ml) return;
    setWaterMl((w) => Math.max(0, w + ml)); // optimistic
    await supabase.from("water_logs").insert({ user_id: userId, log_date: date, amount_ml: ml });
  }, [userId, date]);

  const resetWater = useCallback(async () => {
    if (!userId) return;
    setWaterMl(0);
    await supabase.from("water_logs").delete().eq("user_id", userId).eq("log_date", date);
  }, [userId, date]);

  return { ready, userId, date, totals, waterMl, goals, profile, addWater, resetWater, refresh: () => userId && refresh(userId) };
}