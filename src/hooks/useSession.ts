import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const remember = localStorage.getItem("ff_remember_me");
    const skip = sessionStorage.getItem("ff_skip_remember_check");
    if (remember === "false" && !skip) {
      supabase.auth.signOut().catch(() => {});
    } else if (skip) {
      sessionStorage.removeItem("ff_skip_remember_check");
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}