import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reset password — Fuel & Flex" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Toaster theme="dark" position="top-center" />
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-emerald-500/20 bg-zinc-950 p-6 space-y-4">
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full h-11 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-emerald-500 outline-none px-3 text-sm" />
        <button disabled={busy} className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}Update password
        </button>
      </form>
    </div>
  );
}