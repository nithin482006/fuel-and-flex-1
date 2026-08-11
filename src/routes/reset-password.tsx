import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

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
    <div className="ff-page min-h-screen flex items-center justify-center px-4">
      <Toaster theme="dark" position="top-center" />
      <form onSubmit={submit} className="ff-card w-full max-w-md p-6 space-y-4">
        <BrandLogo size="sm" />
        <h1 className="ff-display text-base font-bold uppercase">Set a new password</h1>
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="ff-input w-full h-11 outline-none px-3 text-sm" />
        <button disabled={busy} className="ff-btn-neon w-full h-11 flex items-center justify-center gap-2 disabled:opacity-50">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}Update password
        </button>
      </form>
    </div>
  );
}