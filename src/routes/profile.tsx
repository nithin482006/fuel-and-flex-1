import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";
import { ArrowLeft, Loader2, LogOut, Save } from "lucide-react";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({ meta: [{ title: "Profile — Fuel & Flex" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [f, setF] = useState<any>({
    full_name: "", age: "", gender: "", height_cm: "", weight_kg: "",
    fitness_goal: "", activity_level: "", target_weight: "",
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return navigate({ to: "/auth" });
      setEmail(u.user.email ?? "");
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", u.user.id).maybeSingle();
      if (p) {
        setF({
          full_name: p.full_name ?? "", age: p.age ?? "", gender: p.gender ?? "",
          height_cm: p.height_cm ?? "", weight_kg: p.weight_kg ?? "",
          fitness_goal: p.fitness_goal ?? "", activity_level: p.activity_level ?? "",
          target_weight: p.target_weight ?? "",
        });
      }
      setReady(true);
    })();
  }, [navigate]);

  const h = parseFloat(f.height_cm), w = parseFloat(f.weight_kg);
  const bmi = h > 0 && w > 0 ? Math.round((w / ((h / 100) ** 2)) * 10) / 10 : null;
  const bmiCat = bmi == null ? null : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";

  async function save() {
    if (!f.full_name?.trim()) return toast.error("Name is required.");
    if (!f.age) return toast.error("Age is required.");
    if (!f.height_cm || !f.weight_kg) return toast.error("Height and weight are required.");
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setBusy(false); return; }
    const payload = {
      user_id: u.user.id,
      full_name: f.full_name.trim(),
      age: +f.age, gender: f.gender || null,
      height_cm: +f.height_cm, weight_kg: +f.weight_kg,
      fitness_goal: f.fitness_goal || null,
      activity_level: f.activity_level || null,
      target_weight: f.target_weight ? +f.target_weight : null,
      onboarding_completed: true,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (!ready) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <Toaster theme="dark" position="top-center" />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-emerald-400"><ArrowLeft className="w-4 h-4" />Dashboard</Link>
          <button onClick={signOut} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-red-400"><LogOut className="w-4 h-4" />Sign out</button>
        </div>

        <h1 className="text-2xl font-bold mb-1">Your Profile</h1>
        <p className="text-sm text-zinc-400 mb-6">{email}</p>

        <div className="rounded-2xl border border-emerald-500/20 bg-zinc-950/80 p-6 space-y-4">
          <Field label="Full name"><input className={inp} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age"><input type="number" className={inp} value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} /></Field>
            <Field label="Gender">
              <select className={inp} value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}>
                <option value="">—</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)"><input type="number" step="0.1" className={inp} value={f.height_cm} onChange={(e) => setF({ ...f, height_cm: e.target.value })} /></Field>
            <Field label="Weight (kg)"><input type="number" step="0.1" className={inp} value={f.weight_kg} onChange={(e) => setF({ ...f, weight_kg: e.target.value })} /></Field>
          </div>

          {bmi != null && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="text-xs text-zinc-400">BMI (auto-calculated)</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-emerald-400">{bmi}</span>
                <span className="text-sm text-zinc-300">{bmiCat}</span>
              </div>
            </div>
          )}

          <Field label="Fitness goal">
            <select className={inp} value={f.fitness_goal} onChange={(e) => setF({ ...f, fitness_goal: e.target.value })}>
              <option value="">—</option><option value="lose_weight">Lose weight</option><option value="build_muscle">Build muscle</option><option value="maintain_weight">Maintain weight</option>
            </select>
          </Field>
          <Field label="Activity level">
            <select className={inp} value={f.activity_level} onChange={(e) => setF({ ...f, activity_level: e.target.value })}>
              <option value="">—</option><option value="sedentary">Sedentary</option><option value="light">Lightly active</option><option value="moderate">Moderately active</option><option value="very">Very active</option>
            </select>
          </Field>
          <Field label="Target weight (kg)"><input type="number" step="0.1" className={inp} value={f.target_weight} onChange={(e) => setF({ ...f, target_weight: e.target.value })} /></Field>

          <button onClick={save} disabled={busy} className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full h-11 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none px-3 text-sm text-white";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</span>{children}</label>;
}