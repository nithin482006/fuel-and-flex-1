// Macro calculation helpers (Mifflin-St Jeor + TDEE + goal adjust)

export type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";
export type FitnessGoal = "lose_weight" | "maintain_weight" | "build_muscle";

export const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extreme: 1.9,
};

export function calcBMR(gender: string | null, weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "female" ? base - 161 : base + 5;
}

export function calcTDEE(bmr: number, activity: string | null) {
  const f = ACTIVITY_FACTORS[activity ?? "moderate"] ?? 1.55;
  return bmr * f;
}

export function adjustForGoal(tdee: number, goal: string | null) {
  if (goal === "lose_weight") return tdee * 0.85;
  if (goal === "build_muscle") return tdee * 1.1;
  return tdee;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function computeMacroTargets(profile: {
  age?: number | null;
  gender?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  activity_level?: string | null;
  fitness_goal?: string | null;
}): MacroTargets {
  const age = Number(profile.age) || 30;
  const h = Number(profile.height_cm) || 170;
  const w = Number(profile.weight_kg) || 70;
  const bmr = calcBMR(profile.gender ?? null, w, h, age);
  const tdee = calcTDEE(bmr, profile.activity_level ?? null);
  const cals = Math.round(adjustForGoal(tdee, profile.fitness_goal ?? null));
  // Protein: 1.8 g/kg for muscle, 2.0 for cut, 1.6 maintain
  const proteinPerKg =
    profile.fitness_goal === "build_muscle" ? 1.8 :
    profile.fitness_goal === "lose_weight" ? 2.0 : 1.6;
  const protein = Math.round(w * proteinPerKg);
  const fat = Math.round((cals * 0.25) / 9); // 25% of cals from fat
  const carbCals = cals - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(carbCals / 4));
  const fiber = Math.round(cals / 1000 * 14); // 14g / 1000kcal
  return { calories: cals, protein, carbs, fat, fiber };
}

export const MEALS: { key: string; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snacks", label: "Snacks" },
  { key: "pre_workout", label: "Pre-Workout" },
  { key: "post_workout", label: "Post-Workout" },
];

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysISO(iso: string, delta: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}