import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";
import { Loader2, User, LogOut, Activity, Target, Ruler, Weight } from "lucide-react";

// @ts-expect-error - JSX module without types
const FuelAndFlex = lazy(() => import("@/components/FuelAndFlex.jsx"));

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Fuel & Flex — Training & Nutrition Tracker" },
      { name: "description", content: "Track workouts, protein, water, sleep and creatine with a futuristic neon-green dashboard." },
      { property: "og:title", content: "Fuel & Flex — Training & Nutrition Tracker" },
      { property: "og:description", content: "Track workouts, protein, water, sleep and creatine with a futuristic neon-green dashboard." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", data.user.id).maybeSingle();
      if (!mounted) return;
      if (!p || !p.onboarding_completed) {
        navigate({ to: "/onboarding" });
        return;
      }
      setProfile(p);
      setStatus("ready");
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth" });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (status === "loading") {
    return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  const goalLabel: Record<string, string> = {
    lose_weight: "Lose weight", build_muscle: "Build muscle", maintain_weight: "Maintain weight",
  };

  return (
    <div className="min-h-screen bg-black">
      <Toaster theme="dark" position="top-center" />
      {/* Top bar with welcome + profile menu */}
      <div className="border-b border-emerald-500/10 bg-black/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-zinc-500">Welcome back,</div>
            <div className="text-sm font-semibold text-white truncate">{profile.full_name || "Athlete"}</div>
          </div>
          <div className="flex items-center gap-2">
            <StatChip icon={<Ruler className="w-3.5 h-3.5" />} label="Height" value={`${profile.height_cm} cm`} />
            <StatChip icon={<Weight className="w-3.5 h-3.5" />} label="Weight" value={`${profile.weight_kg} kg`} />
            <StatChip icon={<Activity className="w-3.5 h-3.5" />} label="BMI" value={`${profile.bmi ?? "—"} · ${profile.bmi_category ?? ""}`} highlight />
            {profile.fitness_goal && <StatChip icon={<Target className="w-3.5 h-3.5" />} label="Goal" value={goalLabel[profile.fitness_goal] ?? profile.fitness_goal} />}
            <Link to="/profile" className="ml-1 h-9 w-9 rounded-full bg-zinc-900 border border-emerald-500/30 flex items-center justify-center hover:bg-zinc-800 text-emerald-400" title="Profile">
              <User className="w-4 h-4" />
            </Link>
            <button onClick={signOut} className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-red-400" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <FuelAndFlex />
      </Suspense>
    </div>
  );
}

function StatChip({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`hidden md:flex items-center gap-2 h-9 px-3 rounded-full border text-xs ${highlight ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}>
      <span className="opacity-80">{icon}</span>
      <span className="text-zinc-500">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
