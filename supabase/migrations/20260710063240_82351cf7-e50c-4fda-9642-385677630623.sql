
-- 1) extend nutrition_goals
ALTER TABLE public.nutrition_goals
  ADD COLUMN IF NOT EXISTS water_goal_ml INTEGER NOT NULL DEFAULT 3500;

-- 2) extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS starting_weight_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS target_weight_kg NUMERIC;

-- 3) water_logs table
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ml INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.water_logs TO authenticated;
GRANT ALL ON public.water_logs TO service_role;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own water logs" ON public.water_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS water_logs_user_date_idx ON public.water_logs (user_id, log_date);

-- 4) weight_history table
CREATE TABLE IF NOT EXISTS public.weight_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC NOT NULL,
  bmi NUMERIC,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weight_history TO authenticated;
GRANT ALL ON public.weight_history TO service_role;
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own weight history" ON public.weight_history
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS weight_history_user_time_idx ON public.weight_history (user_id, recorded_at);

-- 5) trigger: snapshot weight on profile change
CREATE OR REPLACE FUNCTION public.snapshot_weight_history()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.weight_kg IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.weight_kg IS DISTINCT FROM OLD.weight_kg) THEN
    INSERT INTO public.weight_history (user_id, weight_kg, bmi)
    VALUES (NEW.user_id, NEW.weight_kg, NEW.bmi);
    IF NEW.starting_weight_kg IS NULL THEN
      NEW.starting_weight_kg := NEW.weight_kg;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_snapshot_weight ON public.profiles;
CREATE TRIGGER trg_snapshot_weight
  BEFORE INSERT OR UPDATE OF weight_kg ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_weight_history();

-- 6) backfill starting_weight for existing profiles
UPDATE public.profiles
  SET starting_weight_kg = weight_kg
  WHERE starting_weight_kg IS NULL AND weight_kg IS NOT NULL;

-- 7) realtime
ALTER TABLE public.diary_entries REPLICA IDENTITY FULL;
ALTER TABLE public.water_logs REPLICA IDENTITY FULL;
ALTER TABLE public.weight_history REPLICA IDENTITY FULL;
ALTER TABLE public.nutrition_goals REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.diary_entries; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.water_logs; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.weight_history; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.nutrition_goals; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
