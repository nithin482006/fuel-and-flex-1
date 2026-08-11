import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";
import {
  ArrowLeft, Loader2, Plus, Search, Trash2, Star, Copy, Calendar,
  ChevronLeft, ChevronRight, Utensils, Sparkles, X, Save, BarChart3, Flame, Droplet, RotateCcw,
} from "lucide-react";
import { computeMacroTargets, MEALS, todayISO, addDaysISO, type MacroTargets } from "@/lib/macros";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/macros")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Macros — Fuel & Flex" },
    { name: "description", content: "Track calories and macronutrients with a personalized daily food diary." },
  ] }),
  component: MacrosPage,
});

type Food = {
  id: string; name: string; brand: string | null; category: string;
  serving_size: number; serving_unit: string;
  calories: number; protein: number; carbs: number; fat: number; fiber: number;
  sugar?: number | null; sodium?: number | null;
};

type Entry = {
  id: string; meal_type: string; food_name: string; quantity: number;
  serving_size: number; serving_unit: string; entry_date: string;
  calories: number; protein: number; carbs: number; fat: number; fiber: number;
  is_favorite: boolean; food_id: string | null; user_food_id: string | null;
};

function MacrosPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [date, setDate] = useState<string>(todayISO());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [waterLogs, setWaterLogs] = useState<{ id: string; amount_ml: number; created_at: string }[]>([]);
  const [pickerMeal, setPickerMeal] = useState<string | null>(null);
  const [showGoals, setShowGoals] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Load user + profile + goals
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return navigate({ to: "/auth" });
      setUserId(u.user.id);
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", u.user.id).maybeSingle();
      if (!p || !p.onboarding_completed) return navigate({ to: "/onboarding" });
      setProfile(p);
      let { data: g } = await supabase.from("nutrition_goals").select("*").eq("user_id", u.user.id).maybeSingle();
      if (!g) {
        const auto = computeMacroTargets(p);
        const { data: created } = await supabase.from("nutrition_goals").insert({
          user_id: u.user.id, goal_type: "auto", is_custom: false,
          calorie_goal: auto.calories, protein_goal: auto.protein,
          carb_goal: auto.carbs, fat_goal: auto.fat, fiber_goal: auto.fiber,
        }).select().single();
        g = created;
      } else if (!g.is_custom) {
        // refresh auto values if profile changed
        const auto = computeMacroTargets(p);
        if (auto.calories !== Number(g.calorie_goal)) {
          const { data: upd } = await supabase.from("nutrition_goals").update({
            calorie_goal: auto.calories, protein_goal: auto.protein,
            carb_goal: auto.carbs, fat_goal: auto.fat, fiber_goal: auto.fiber,
          }).eq("user_id", u.user.id).select().single();
          if (upd) g = upd;
        }
      }
      setGoals(g);
      setReady(true);
    })();
  }, [navigate]);

  // Load entries for date
  const loadEntries = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from("diary_entries").select("*").eq("user_id", userId).eq("entry_date", date).order("created_at");
    setEntries((data as Entry[]) || []);
  }, [userId, date]);
  useEffect(() => { loadEntries(); }, [loadEntries]);

  const loadWater = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from("water_logs").select("id,amount_ml,created_at").eq("user_id", userId).eq("log_date", date).order("created_at");
    setWaterLogs((data as any) || []);
  }, [userId, date]);
  useEffect(() => { loadWater(); }, [loadWater]);

  // Realtime sync from other pages / devices
  useEffect(() => {
    if (!userId) return;
    const ch = supabase.channel(`macros-sync-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "diary_entries", filter: `user_id=eq.${userId}` }, () => loadEntries())
      .on("postgres_changes", { event: "*", schema: "public", table: "water_logs", filter: `user_id=eq.${userId}` }, () => loadWater())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, loadEntries, loadWater]);

  const waterMl = useMemo(() => waterLogs.reduce((s, w) => s + Number(w.amount_ml || 0), 0), [waterLogs]);

  async function addWater(ml: number) {
    if (!userId || !ml) return;
    const { error } = await supabase.from("water_logs").insert({ user_id: userId, log_date: date, amount_ml: ml });
    if (error) return toast.error(error.message);
    loadWater();
  }
  async function resetWater() {
    if (!userId) return;
    const { error } = await supabase.from("water_logs").delete().eq("user_id", userId).eq("log_date", date);
    if (error) return toast.error(error.message);
    loadWater();
  }

  const totals = useMemo(() => entries.reduce((a, e) => ({
    calories: a.calories + Number(e.calories),
    protein: a.protein + Number(e.protein),
    carbs: a.carbs + Number(e.carbs),
    fat: a.fat + Number(e.fat),
    fiber: a.fiber + Number(e.fiber),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }), [entries]);

  async function deleteEntry(id: string) {
    const { error } = await supabase.from("diary_entries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setEntries((s) => s.filter((e) => e.id !== id));
    toast.success("Removed");
  }

  async function copyYesterday() {
    const y = addDaysISO(date, -1);
    const { data } = await supabase.from("diary_entries").select("*").eq("user_id", userId).eq("entry_date", y);
    if (!data || data.length === 0) return toast.info("No entries to copy from yesterday.");
    const rows = data.map((e: any) => ({
      user_id: userId, entry_date: date, meal_type: e.meal_type, food_id: e.food_id, user_food_id: e.user_food_id,
      food_name: e.food_name, quantity: e.quantity, serving_size: e.serving_size, serving_unit: e.serving_unit,
      calories: e.calories, protein: e.protein, carbs: e.carbs, fat: e.fat, fiber: e.fiber,
    }));
    const { error } = await supabase.from("diary_entries").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Copied ${rows.length} entries from yesterday`);
    loadEntries();
  }

  if (!ready || !goals) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const target: MacroTargets = {
    calories: Number(goals.calorie_goal), protein: Number(goals.protein_goal),
    carbs: Number(goals.carb_goal), fat: Number(goals.fat_goal), fiber: Number(goals.fiber_goal),
  };

  return (
    <div className="ff-page min-h-screen">
      <Toaster theme="dark" position="top-center" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="ff-mono flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-400"><ArrowLeft className="w-4 h-4" />Dashboard</Link>
            <h1 className="ff-display text-lg md:text-xl font-bold uppercase">
              <span className="text-emerald-400">Macros</span> Management
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAnalytics(true)} className="ff-btn h-9 px-3 text-xs flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" />Analytics</button>
            <button onClick={() => setShowCustom(true)} className="ff-btn h-9 px-3 text-xs flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Custom food</button>
            <button onClick={() => setShowGoals(true)} className="ff-btn h-9 px-3 text-xs flex items-center gap-1.5 text-emerald-300" style={{ borderColor: "var(--ff-bdr3)", background: "rgba(0,255,135,0.08)" }}><Sparkles className="w-3.5 h-3.5" />Goals</button>
          </div>
        </div>

        {/* Date selector */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button onClick={() => setDate(addDaysISO(date, -1))} className="ff-btn h-9 w-9 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
          <div className="ff-btn ff-mono h-9 px-4 flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent outline-none [color-scheme:dark]" />
            {date === todayISO() && <span className="text-[10px] font-bold text-emerald-400 uppercase">Today</span>}
          </div>
          <button onClick={() => setDate(addDaysISO(date, 1))} className="ff-btn h-9 w-9 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={copyYesterday} className="ff-btn ml-2 h-9 px-3 text-xs flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" />Copy yesterday</button>
        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <CalorieCircle consumed={totals.calories} goal={target.calories} />
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
            <MacroCard label="Protein" unit="g" consumed={totals.protein} goal={target.protein} color="from-red-400 to-orange-400" />
            <MacroCard label="Carbs"   unit="g" consumed={totals.carbs}   goal={target.carbs}   color="from-amber-400 to-yellow-300" />
            <MacroCard label="Fat"     unit="g" consumed={totals.fat}     goal={target.fat}     color="from-purple-400 to-pink-400" />
            <MacroCard label="Fiber"   unit="g" consumed={totals.fiber}   goal={target.fiber}   color="from-emerald-400 to-teal-300" />
          </div>
        </div>

        {/* Water */}
        <WaterCard
          consumedMl={waterMl}
          goalMl={Number(goals.water_goal_ml || 3500)}
          onAdd={addWater}
          onReset={resetWater}
        />

        {/* Meals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEALS.map((m) => {
            const mealEntries = entries.filter((e) => e.meal_type === m.key);
            const t = mealEntries.reduce((a, e) => ({
              c: a.c + Number(e.calories), p: a.p + Number(e.protein),
              cb: a.cb + Number(e.carbs), f: a.f + Number(e.fat), fb: a.fb + Number(e.fiber),
            }), { c: 0, p: 0, cb: 0, f: 0, fb: 0 });
            return (
              <div key={m.key} className="ff-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-400" />
                    <h3 className="ff-display text-sm font-bold uppercase">{m.label}</h3>
                    <span className="ff-mono text-[11px] text-zinc-500">· {Math.round(t.c)} kcal</span>
                  </div>
                  <button onClick={() => setPickerMeal(m.key)} className="ff-btn h-8 px-3 text-xs flex items-center gap-1 text-emerald-300" style={{ borderColor: "var(--ff-bdr3)", background: "rgba(0,255,135,0.08)" }}><Plus className="w-3.5 h-3.5" />Add food</button>
                </div>
                <div className="space-y-1.5">
                  {mealEntries.length === 0 && <div className="text-xs text-zinc-600 py-2">No foods logged.</div>}
                  {mealEntries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50 group">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{e.food_name}</div>
                        <div className="ff-mono text-[11px] text-zinc-500">{Number(e.quantity) * Number(e.serving_size)} {e.serving_unit} · P {Math.round(Number(e.protein))} · C {Math.round(Number(e.carbs))} · F {Math.round(Number(e.fat))}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="ff-mono text-sm font-bold text-emerald-400 tabular-nums">{Math.round(Number(e.calories))}</div>
                        <button onClick={() => deleteEntry(e.id)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                {mealEntries.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/50 flex gap-3 text-[10px] uppercase tracking-wide text-zinc-500">
                    <span>P <b className="text-white">{Math.round(t.p)}g</b></span>
                    <span>C <b className="text-white">{Math.round(t.cb)}g</b></span>
                    <span>F <b className="text-white">{Math.round(t.f)}g</b></span>
                    <span>Fb <b className="text-white">{Math.round(t.fb)}g</b></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Today summary */}
        <div className="ff-card ff-card-glow mt-6 p-5">
          <div className="flex items-center gap-2 mb-3"><Flame className="w-4 h-4 text-emerald-400" /><h3 className="ff-display text-sm font-bold uppercase">Today's Nutrition</h3></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {([
              ["Calories", totals.calories, target.calories, "kcal"],
              ["Protein", totals.protein, target.protein, "g"],
              ["Carbs", totals.carbs, target.carbs, "g"],
              ["Fat", totals.fat, target.fat, "g"],
              ["Fiber", totals.fiber, target.fiber, "g"],
            ] as const).map(([label, c, g, u]) => (
              <div key={label} className="ff-card p-3">
                <div className="ff-label">{label}</div>
                <div className="ff-mono text-lg font-bold tabular-nums">{Math.round(c)}<span className="text-xs text-zinc-500"> / {Math.round(g)} {u}</span></div>
                <div className="ff-mono text-[11px] text-emerald-400">{Math.max(0, Math.round(g - c))} {u} left</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pickerMeal && (
        <FoodPicker
          userId={userId} date={date} mealKey={pickerMeal}
          onClose={() => setPickerMeal(null)}
          onAdded={() => { loadEntries(); }}
        />
      )}
      {showGoals && (
        <GoalsModal
          profile={profile} goals={goals}
          onClose={() => setShowGoals(false)}
          onSaved={(g) => { setGoals(g); setShowGoals(false); }}
        />
      )}
      {showCustom && (
        <CustomFoodModal userId={userId} onClose={() => setShowCustom(false)} />
      )}
      {showAnalytics && (
        <AnalyticsModal userId={userId} target={target} onClose={() => setShowAnalytics(false)} />
      )}
    </div>
  );
}

function CalorieCircle({ consumed, goal }: { consumed: number; goal: number }) {
  const pct = Math.min(100, (consumed / goal) * 100);
  const r = 70; const c = 2 * Math.PI * r;
  const remaining = Math.max(0, goal - consumed);
  return (
    <div className="ff-card ff-card-glow p-5 flex items-center gap-5">
      <div className="relative">
        <svg width="170" height="170" viewBox="0 0 170 170" className="-rotate-90">
          <circle cx="85" cy="85" r={r} strokeWidth="12" stroke="var(--ff-surf3)" fill="none" />
          <circle cx="85" cy="85" r={r} strokeWidth="12" stroke="url(#gradC)" fill="none"
            strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }} />
          <defs><linearGradient id="gradC" x1="0" x2="1"><stop offset="0" stopColor="var(--ff-neon-dim)" /><stop offset="1" stopColor="var(--ff-neon)" /></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="ff-mono text-3xl font-bold tabular-nums">{Math.round(consumed)}</div>
          <div className="ff-label">of {Math.round(goal)}</div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="ff-display text-[10px] uppercase text-emerald-400 font-bold mb-1">Calories</div>
        <Row label="Goal" value={`${Math.round(goal)} kcal`} />
        <Row label="Consumed" value={`${Math.round(consumed)} kcal`} />
        <Row label="Remaining" value={`${Math.round(remaining)} kcal`} highlight />
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="ff-mono flex items-center justify-between py-1 text-xs">
      <span className="text-zinc-400">{label}</span>
      <span className={highlight ? "text-emerald-400 font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}

function MacroCard({ label, unit, consumed, goal, color }: { label: string; unit: string; consumed: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  return (
    <div className="ff-card p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="ff-label">{label}</div>
        <div className="ff-mono text-[10px] text-zinc-500">{Math.round(pct)}%</div>
      </div>
      <div className="ff-mono text-2xl font-bold tabular-nums">{Math.round(consumed)}<span className="text-xs text-zinc-500">/{Math.round(goal)}{unit}</span></div>
      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--ff-surf3)" }}>
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%`, transition: "width 0.4s ease" }} />
      </div>
      <div className="ff-mono mt-1 text-[11px] text-zinc-500">{Math.max(0, Math.round(goal - consumed))}{unit} remaining</div>
    </div>
  );
}

// ---------- Water tracking ----------
function WaterCard({ consumedMl, goalMl, onAdd, onReset }: { consumedMl: number; goalMl: number; onAdd: (ml: number) => void; onReset: () => void }) {
  const [manual, setManual] = useState<number>(200);
  const pct = goalMl > 0 ? Math.min(100, (consumedMl / goalMl) * 100) : 0;
  const remaining = Math.max(0, goalMl - consumedMl);
  const r = 60; const c = 2 * Math.PI * r;
  const goalReached = consumedMl >= goalMl;
  return (
    <div className={`ff-card ${goalReached ? "ff-card-glow" : ""} p-5 mb-6`}>
      <div className="flex items-center gap-2 mb-4">
        <Droplet className="w-4 h-4 text-sky-400" />
        <h3 className="ff-display text-sm font-bold uppercase">Water Intake</h3>
        {goalReached && <span className="ff-display ml-2 text-[10px] font-bold uppercase text-emerald-400">Goal reached ✓</span>}
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative shrink-0">
          <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
            <circle cx="75" cy="75" r={r} strokeWidth="12" stroke="var(--ff-surf3)" fill="none" />
            <circle cx="75" cy="75" r={r} strokeWidth="12" stroke="url(#gradW)" fill="none"
              strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease" }} />
            <defs><linearGradient id="gradW" x1="0" x2="1"><stop offset="0" stopColor="#3B82F6" /><stop offset="1" stopColor="var(--ff-water)" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="ff-mono text-2xl font-bold tabular-nums">{(consumedMl / 1000).toFixed(2)}L</div>
            <div className="ff-label">{Math.round(pct)}%</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <Row label="Goal" value={`${(goalMl / 1000).toFixed(2)} L`} />
          <Row label="Consumed" value={`${(consumedMl / 1000).toFixed(2)} L`} />
          <Row label="Remaining" value={`${(remaining / 1000).toFixed(2)} L`} highlight />
        </div>
        <div className="w-full">
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[250, 500, 750, 1000].map((ml) => (
              <button key={ml} onClick={() => onAdd(ml)}
                className="ff-btn h-10 text-xs font-semibold text-sky-300" style={{ borderColor: "rgba(96,165,250,0.35)", background: "rgba(96,165,250,0.10)" }}>
                +{ml < 1000 ? `${ml}ml` : `${ml / 1000}L`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="number" min={1} value={manual} onChange={(e) => setManual(+e.target.value)}
              className="ff-input flex-1 h-10 outline-none px-3 text-sm" placeholder="ml" />
            <button onClick={() => manual > 0 && onAdd(manual)} className="ff-btn h-10 px-4 text-sm font-bold flex items-center gap-1" style={{ background: "var(--ff-water)", borderColor: "var(--ff-water)", color: "#04121F" }}><Plus className="w-4 h-4" />Add</button>
            <button onClick={onReset} title="Reset today's water" className="ff-btn h-10 w-10 text-zinc-400 hover:text-red-400 flex items-center justify-center"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Food picker ----------
function FoodPicker({ userId, date, mealKey, onClose, onAdded }: { userId: string; date: string; mealKey: string; onClose: () => void; onAdded: () => void }) {
  const [q, setQ] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [customs, setCustoms] = useState<Food[]>([]);
  const [recent, setRecent] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<(Food & { isCustom?: boolean }) | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [servingSize, setServingSize] = useState<number>(100);
  const [unit, setUnit] = useState<string>("g");

  useEffect(() => {
    (async () => {
      const t = q.trim();
      let base = supabase.from("foods").select("*").limit(50);
      if (t) base = base.or(`name.ilike.%${t}%,brand.ilike.%${t}%,category.ilike.%${t}%`);
      const { data } = await base.order("name");
      setFoods((data as Food[]) || []);
      let cq = supabase.from("user_foods").select("*").eq("user_id", userId).limit(50);
      if (t) cq = cq.ilike("name", `%${t}%`);
      const { data: cd } = await cq.order("created_at", { ascending: false });
      setCustoms((cd as any) || []);
    })();
  }, [q, userId]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("diary_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
      setRecent((data as Entry[]) || []);
    })();
  }, [userId]);

  function pick(f: Food, isCustom?: boolean) {
    setSelected({ ...f, isCustom });
    setServingSize(Number(f.serving_size));
    setUnit(f.serving_unit || "g");
    setQty(1);
  }

  async function add() {
    if (!selected) return;
    const scale = (Number(qty) * Number(servingSize)) / Number(selected.serving_size);
    const row = {
      user_id: userId, entry_date: date, meal_type: mealKey,
      food_id: selected.isCustom ? null : selected.id,
      user_food_id: selected.isCustom ? selected.id : null,
      food_name: selected.name + (selected.brand ? ` · ${selected.brand}` : ""),
      quantity: Number(qty), serving_size: Number(servingSize), serving_unit: unit,
      calories: Math.round(Number(selected.calories) * scale * 10) / 10,
      protein: Math.round(Number(selected.protein) * scale * 10) / 10,
      carbs: Math.round(Number(selected.carbs) * scale * 10) / 10,
      fat: Math.round(Number(selected.fat) * scale * 10) / 10,
      fiber: Math.round(Number(selected.fiber) * scale * 10) / 10,
    };
    const { error } = await supabase.from("diary_entries").insert(row);
    if (error) return toast.error(error.message);
    toast.success(`Added ${selected.name}`);
    onAdded(); onClose();
  }

  async function reAdd(e: Entry) {
    const { error } = await supabase.from("diary_entries").insert({
      user_id: userId, entry_date: date, meal_type: mealKey, food_id: e.food_id, user_food_id: e.user_food_id,
      food_name: e.food_name, quantity: e.quantity, serving_size: e.serving_size, serving_unit: e.serving_unit,
      calories: e.calories, protein: e.protein, carbs: e.carbs, fat: e.fat, fiber: e.fiber,
    });
    if (error) return toast.error(error.message);
    toast.success("Re-added"); onAdded(); onClose();
  }

  const scale = selected ? (Number(qty) * Number(servingSize)) / Number(selected.serving_size) : 1;
  const preview = selected ? {
    calories: Math.round(Number(selected.calories) * scale),
    protein: Math.round(Number(selected.protein) * scale),
    carbs: Math.round(Number(selected.carbs) * scale),
    fat: Math.round(Number(selected.fat) * scale),
    fiber: Math.round(Number(selected.fiber) * scale),
  } : null;

  return (
    <Overlay onClose={onClose}>
      <div className="ff-card w-full max-w-3xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500">Add food to</div>
            <div className="ff-display text-sm font-bold uppercase">{mealKey.replace("_", "-")}</div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {!selected ? (
          <>
            <div className="p-4 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods, brands, categories..." className="ff-input w-full h-11 pl-10 pr-3 outline-none text-sm" />
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {customs.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">Your foods</div>
                  {customs.map((f) => <FoodRow key={f.id} f={f} onPick={() => pick(f, true)} />)}
                </>
              )}
              {!q && recent.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">Recent</div>
                  {recent.slice(0, 5).map((r) => (
                    <button key={r.id} onClick={() => reAdd(r)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-900 text-left">
                      <div className="min-w-0"><div className="text-sm font-medium truncate">{r.food_name}</div>
                        <div className="text-[11px] text-zinc-500">{Number(r.quantity) * Number(r.serving_size)} {r.serving_unit}</div></div>
                      <div className="text-sm font-bold text-emerald-400">{Math.round(Number(r.calories))} kcal</div>
                    </button>
                  ))}
                </>
              )}
              <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Database</div>
              {foods.map((f) => <FoodRow key={f.id} f={f} onPick={() => pick(f)} />)}
              {foods.length === 0 && <div className="p-6 text-center text-sm text-zinc-500">No foods found.</div>}
            </div>
          </>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <div className="text-xs text-zinc-500">{selected.category}{selected.brand ? ` · ${selected.brand}` : ""}</div>
              <div className="text-xl font-bold">{selected.name}</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Quantity"><input type="number" step="0.25" min="0" value={qty} onChange={(e) => setQty(+e.target.value)} className={inp} /></Field>
              <Field label="Serving size"><input type="number" step="1" min="0" value={servingSize} onChange={(e) => setServingSize(+e.target.value)} className={inp} /></Field>
              <Field label="Unit">
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inp}>
                  {["g","ml","piece","cup","tbsp","tsp","oz","serving"].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {preview && Object.entries(preview).map(([k, v]) => (
                <div key={k} className="ff-card p-2 text-center">
                  <div className="text-[10px] uppercase text-zinc-500">{k}</div>
                  <div className="ff-mono text-lg font-bold text-emerald-400 tabular-nums">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(null)} className="ff-btn flex-1 h-11 text-sm">Back</button>
              <button onClick={add} className="ff-btn-neon flex-1 h-11 flex items-center justify-center gap-2"><Plus className="w-4 h-4" />Add to meal</button>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

function FoodRow({ f, onPick }: { f: Food; onPick: () => void }) {
  return (
    <button onClick={onPick} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-900 text-left border-b border-zinc-900/50">
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{f.name}{f.brand && <span className="text-zinc-500"> · {f.brand}</span>}</div>
        <div className="text-[11px] text-zinc-500">{f.category} · per {f.serving_size} {f.serving_unit}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold text-emerald-400 tabular-nums">{Math.round(Number(f.calories))} kcal</div>
        <div className="text-[10px] text-zinc-500">P{Math.round(Number(f.protein))} C{Math.round(Number(f.carbs))} F{Math.round(Number(f.fat))}</div>
      </div>
    </button>
  );
}

// ---------- Goals modal ----------
function GoalsModal({ profile, goals, onClose, onSaved }: { profile: any; goals: any; onClose: () => void; onSaved: (g: any) => void }) {
  const [mode, setMode] = useState<"auto" | "custom">(goals?.is_custom ? "custom" : "auto");
  const auto = useMemo(() => computeMacroTargets(profile), [profile]);
  const [f, setF] = useState({
    calorie_goal: goals?.calorie_goal ?? auto.calories,
    protein_goal: goals?.protein_goal ?? auto.protein,
    carb_goal: goals?.carb_goal ?? auto.carbs,
    fat_goal: goals?.fat_goal ?? auto.fat,
    fiber_goal: goals?.fiber_goal ?? auto.fiber,
    water_goal_ml: goals?.water_goal_ml ?? 3500,
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const payload = mode === "auto"
      ? { is_custom: false, goal_type: "auto", calorie_goal: auto.calories, protein_goal: auto.protein, carb_goal: auto.carbs, fat_goal: auto.fat, fiber_goal: auto.fiber, water_goal_ml: f.water_goal_ml }
      : { is_custom: true, goal_type: "custom", ...f };
    const { data, error } = await supabase.from("nutrition_goals").update(payload).eq("user_id", goals.user_id).select().single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Goals saved"); onSaved(data);
  }

  return (
    <Overlay onClose={onClose}>
      <div className="ff-card w-full max-w-lg overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="ff-display text-sm font-bold uppercase">Nutrition Goals</div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <label className={`flex-1 h-11 rounded-xl border flex items-center justify-center gap-2 cursor-pointer ${mode === "auto" ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 ff-display text-xs uppercase" : "border-zinc-800 text-zinc-400"}`}>
              <input type="radio" checked={mode === "auto"} onChange={() => setMode("auto")} className="hidden" />Auto (TDEE)
            </label>
            <label className={`flex-1 h-11 rounded-xl border flex items-center justify-center gap-2 cursor-pointer ${mode === "custom" ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 ff-display text-xs uppercase" : "border-zinc-800 text-zinc-400"}`}>
              <input type="radio" checked={mode === "custom"} onChange={() => setMode("custom")} className="hidden" />Custom
            </label>
          </div>
          {mode === "auto" ? (
            <div className="ff-card p-4 text-sm space-y-1">
              <div className="text-xs text-zinc-500 mb-2">Calculated from your profile (Mifflin–St Jeor):</div>
              <Row label="Calories" value={`${auto.calories} kcal`} highlight />
              <Row label="Protein" value={`${auto.protein} g`} />
              <Row label="Carbs" value={`${auto.carbs} g`} />
              <Row label="Fat" value={`${auto.fat} g`} />
              <Row label="Fiber" value={`${auto.fiber} g`} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(["calorie_goal","protein_goal","carb_goal","fat_goal","fiber_goal","water_goal_ml"] as const).map((k) => (
                <Field key={k} label={k.replace("_goal","").replace("carb","carbs")}>
                  <input type="number" min="0" value={(f as any)[k]} onChange={(e) => setF({ ...f, [k]: +e.target.value })} className={inp} />
                </Field>
              ))}
            </div>
          )}
          {mode === "auto" && (
            <Field label="Water goal (ml)">
              <input type="number" min={500} value={f.water_goal_ml} onChange={(e) => setF({ ...f, water_goal_ml: +e.target.value })} className={inp} />
            </Field>
          )}
          <button onClick={save} disabled={busy} className="ff-btn-neon w-full h-11 flex items-center justify-center gap-2 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save goals
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ---------- Custom food modal ----------
function CustomFoodModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [f, setF] = useState({ name: "", brand: "", serving_size: 100, serving_unit: "g", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!f.name.trim()) return toast.error("Name required");
    setBusy(true);
    const { error } = await supabase.from("user_foods").insert({ ...f, user_id: userId });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Custom food saved"); onClose();
  }
  return (
    <Overlay onClose={onClose}>
      <div className="ff-card w-full max-w-lg overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="ff-display text-sm font-bold uppercase">Create custom food</div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Name"><input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Brand (optional)"><input className={inp} value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Serving size"><input type="number" className={inp} value={f.serving_size} onChange={(e) => setF({ ...f, serving_size: +e.target.value })} /></Field>
            <Field label="Unit">
              <select className={inp} value={f.serving_unit} onChange={(e) => setF({ ...f, serving_unit: e.target.value })}>
                {["g","ml","piece","cup","tbsp","tsp","oz","serving"].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {(["calories","protein","carbs","fat","fiber"] as const).map((k) => (
              <Field key={k} label={k}>
                <input type="number" min="0" step="0.1" className={inp} value={(f as any)[k]} onChange={(e) => setF({ ...f, [k]: +e.target.value })} />
              </Field>
            ))}
          </div>
          <button onClick={save} disabled={busy} className="ff-btn-neon w-full h-11 flex items-center justify-center gap-2 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save food
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ---------- Analytics ----------
function AnalyticsModal({ userId, target, onClose }: { userId: string; target: MacroTargets; onClose: () => void }) {
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [metric, setMetric] = useState<"calories" | "protein" | "carbs" | "fat" | "fiber">("calories");
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const start = addDaysISO(todayISO(), -range + 1);
      const { data } = await supabase.from("diary_entries").select("*").eq("user_id", userId).gte("entry_date", start);
      const map = new Map<string, any>();
      for (let i = 0; i < range; i++) {
        const d = addDaysISO(start, i);
        map.set(d, { date: d.slice(5), calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
      }
      (data || []).forEach((e: any) => {
        const r = map.get(e.entry_date); if (!r) return;
        r.calories += Number(e.calories); r.protein += Number(e.protein);
        r.carbs += Number(e.carbs); r.fat += Number(e.fat); r.fiber += Number(e.fiber);
      });
      setRows(Array.from(map.values()));
    })();
  }, [userId, range]);
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r[metric], 0) / rows.length) : 0;
  const streak = (() => {
    let s = 0;
    for (let i = rows.length - 1; i >= 0; i--) { if (rows[i].calories > 0) s++; else break; }
    return s;
  })();
  return (
    <Overlay onClose={onClose}>
      <div className="ff-card w-full max-w-3xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="font-bold">Nutrition Analytics</div>
          <div className="flex gap-2">
            {(["calories","protein","carbs","fat","fiber"] as const).map((m) => (
              <button key={m} onClick={() => setMetric(m)} className={`h-8 px-3 rounded-lg text-xs capitalize ${metric === m ? "bg-emerald-500 text-black font-bold" : "border border-zinc-800 text-zinc-400"}`}>{m}</button>
            ))}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            {[[7,"Daily"],[30,"Weekly"],[90,"Monthly"]].map(([n, l]) => (
              <button key={n as number} onClick={() => setRange(n as 7|30|90)} className={`h-8 px-3 rounded-lg text-xs ${range === n ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300" : "border border-zinc-800 text-zinc-400"}`}>{l as string}</button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Stat label={`Avg ${metric}`} value={avg} />
            <Stat label="Streak (days)" value={streak} />
            <Stat label={`Goal ${metric}`} value={Math.round((target as any)[metric])} />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #10b981", borderRadius: 8 }} />
                <Line type="monotone" dataKey={metric} stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="text-xl font-bold text-emerald-400 tabular-nums">{value}</div>
    </div>
  );
}

// ---------- shared ----------
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">{children}</div>
    </div>
  );
}
const inp = "ff-input w-full h-10 outline-none px-3 text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="ff-label block mb-1">{label}</span>{children}</label>;
}