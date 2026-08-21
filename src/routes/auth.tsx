import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Fuel & Flex" },
      { name: "description", content: "Sign in or create your Fuel & Flex account." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("ff_remember_me");
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome!");
        navigate({ to: "/" });
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ff-page min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <Toaster theme="dark" position="top-center" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.12),transparent_50%)] pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <BrandLogo size="lg" />
        </div>

        <div className="ff-card ff-card-glow backdrop-blur p-6">
          <h1 className="ff-display text-lg font-bold uppercase">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
          </h1>
          <p className="ff-mono text-xs text-zinc-400 mt-2">
            {mode === "signin" ? "Sign in to continue your training." : mode === "signup" ? "Start tracking your workouts today." : "We'll email you a reset link."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <Field label="Full name">
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Alex Johnson" />
              </Field>
            )}
            <Field label="Email">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
            </Field>
            {mode !== "forgot" && (
              <Field label="Password">
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="At least 8 characters" minLength={8} />
              </Field>
            )}

            <button type="submit" disabled={busy} className="ff-btn-neon w-full h-11 disabled:opacity-50 flex items-center justify-center gap-2">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </button>
          </form>

          <div className="mt-5 flex flex-col gap-2 text-sm text-zinc-400">
            {mode === "signin" && (
              <>
                <button type="button" onClick={() => setMode("forgot")} className="text-emerald-400 hover:underline text-left">Forgot password?</button>
                <div>New here? <button type="button" onClick={() => setMode("signup")} className="text-emerald-400 hover:underline">Create an account</button></div>
              </>
            )}
            {mode === "signup" && (
              <div>Already have an account? <button type="button" onClick={() => setMode("signin")} className="text-emerald-400 hover:underline">Sign in</button></div>
            )}
            {mode === "forgot" && (
              <button type="button" onClick={() => setMode("signin")} className="text-emerald-400 hover:underline text-left">Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "ff-input w-full h-11 outline-none px-3 text-sm placeholder:text-zinc-500 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="ff-label block mb-1.5">{label}</span>
      {children}
    </label>
  );
}