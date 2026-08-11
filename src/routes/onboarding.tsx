import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({ meta: [{ title: "Get started — Fuel & Flex" }] }),
  component: Onboarding,
});

type Data = {
  full_name: string;
  age: string;
  gender: string;
  height_cm: string;
  weight_kg: string;
  fitness_goal: string;
  activity_level: string;
  target_weight: string;
};

const STEPS = ["Your info", "Body metrics", "Goals"] as const;

function Onboarding() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [d, setD] = useState<Data>({
    full_name: "", age: "", gender: "", height_cm: "", weight_kg: "",
    fitness_goal: "", activity_level: "", target_weight: "",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return navigate({ to: "/auth" });
      const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", data.user.id).maybeSingle();
      if (prof?.onboarding_completed) return navigate({ to: "/" });
      if (prof) {
        setD((p) => ({
          ...p,
          full_name: prof.full_name ?? (data.user.user_metadata?.full_name ?? ""),
          age: prof.age?.toString() ?? "",
          gender: prof.gender ?? "",
          height_cm: prof.height_cm?.toString() ?? "",
          weight_kg: prof.weight_kg?.toString() ?? "",
          fitness_goal: prof.fitness_goal ?? "",
          activity_level: prof.activity_level ?? "",
          target_weight: prof.target_weight?.toString() ?? "",
        }));
      }
      setReady(true);
    })();
  }, [navigate]);

  const h = parseFloat(d.height_cm), w = parseFloat(d.weight_kg);
  const bmi = h > 0 && w > 0 ? Math.round((w / ((h / 100) ** 2)) * 10) / 10 : null;
  const bmiCat = bmi == null ? null : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";

  function validateStep(): string | null {
    if (step === 0) {
      if (!d.full_name.trim()) return "Please enter your full name.";
      if (!d.age || +d.age < 10 || +d.age > 120) return "Please enter a valid age.";
      if (!d.gender) return "Please select your gender.";
    } else if (step === 1) {
      if (!d.height_cm || +d.height_cm < 80 || +d.height_cm > 260) return "Please enter a valid height in cm.";
      if (!d.weight_kg || +d.weight_kg < 25 || +d.weight_kg > 400) return "Please enter a valid weight in kg.";
    }
    return null;
  }

  async function submit() {
    const err = validateStep();
    if (err) return toast.error(err);
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setBusy(false); return navigate({ to: "/auth" }); }
    const payload = {
      user_id: u.user.id,
      full_name: d.full_name.trim(),
      age: +d.age,
      gender: d.gender,
      height_cm: +d.height_cm,
      weight_kg: +d.weight_kg,
      fitness_goal: d.fitness_goal || null,
      activity_level: d.activity_level || null,
      target_weight: d.target_weight ? +d.target_weight : null,
      onboarding_completed: true,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved!");
    navigate({ to: "/" });
  }

  function next() {
    const err = validateStep();
    if (err) return toast.error(err);
    if (step < STEPS.length - 1) setStep(step + 1);
    else submit();
  }

  if (!ready) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="ff-page min-h-screen px-4 py-10">
      <Toaster theme="dark" position="top-center" />
      <div className="max-w-xl mx-auto">
        <div className="mb-8"><BrandLogo /></div>

        {/* Progress */}
        <div className="mb-6">
          <div className="ff-mono flex justify-between text-[11px] text-zinc-400 mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--ff-surf3)" }}>
            <div className="h-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: "linear-gradient(90deg,var(--ff-neon-dim),var(--ff-neon))" }} />
          </div>
        </div>

        <div className="ff-card p-6 space-y-4">
          {step === 0 && (
            <>
              <h2 className="ff-display text-base font-bold uppercase">Tell us about you</h2>
              <Field label="Full name *">
                <input value={d.full_name} onChange={(e) => setD({ ...d, full_name: e.target.value })} className={inp} />
              </Field>
              <Field label="Age (years) *">
                <input type="number" value={d.age} onChange={(e) => setD({ ...d, age: e.target.value })} className={inp} />
              </Field>
              <Field label="Gender *">
                <select value={d.gender} onChange={(e) => setD({ ...d, gender: e.target.value })} className={inp}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </Field>
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="ff-display text-base font-bold uppercase">Your body metrics</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Height (cm) *">
                  <input type="number" step="0.1" value={d.height_cm} onChange={(e) => setD({ ...d, height_cm: e.target.value })} className={inp} />
                </Field>
                <Field label="Weight (kg) *">
                  <input type="number" step="0.1" value={d.weight_kg} onChange={(e) => setD({ ...d, weight_kg: e.target.value })} className={inp} />
                </Field>
              </div>
              {bmi != null && (
                <div className="ff-card ff-card-glow mt-2 p-4">
                  <div className="ff-label">Your BMI (calculated automatically)</div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="ff-mono text-3xl font-bold text-emerald-400">{bmi}</span>
                    <span className="ff-mono text-xs text-zinc-300">{bmiCat}</span>
                  </div>
                </div>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="ff-display text-base font-bold uppercase">Your goals <span className="text-[10px] text-zinc-500 font-normal">(optional)</span></h2>
              <Field label="Fitness goal">
                <select value={d.fitness_goal} onChange={(e) => setD({ ...d, fitness_goal: e.target.value })} className={inp}>
                  <option value="">Select...</option>
                  <option value="lose_weight">Lose weight</option>
                  <option value="build_muscle">Build muscle</option>
                  <option value="maintain_weight">Maintain weight</option>
                </select>
              </Field>
              <Field label="Activity level">
                <select value={d.activity_level} onChange={(e) => setD({ ...d, activity_level: e.target.value })} className={inp}>
                  <option value="">Select...</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly active</option>
                  <option value="moderate">Moderately active</option>
                  <option value="very">Very active</option>
                </select>
              </Field>
              <Field label="Target weight (kg)">
                <input type="number" step="0.1" value={d.target_weight} onChange={(e) => setD({ ...d, target_weight: e.target.value })} className={inp} />
              </Field>
            </>
          )}

          <div className="flex justify-between pt-2">
            <button disabled={step === 0 || busy} onClick={() => setStep(step - 1)} className="ff-btn h-11 px-4 disabled:opacity-30 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />Back
            </button>
            <button disabled={busy} onClick={next} className="ff-btn-neon h-11 px-5 flex items-center gap-1 disabled:opacity-50">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {step === STEPS.length - 1 ? "Finish" : "Next"}
              {step < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inp = "ff-input w-full h-11 outline-none px-3 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="ff-label block mb-1.5">{label}</span>
      {children}
    </label>
  );
}