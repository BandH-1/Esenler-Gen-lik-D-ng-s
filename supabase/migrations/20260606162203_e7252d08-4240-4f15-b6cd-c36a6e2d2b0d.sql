
-- Balance sync function
CREATE OR REPLACE FUNCTION public.sync_profile_eco_balance(_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
  SET eco_point_balance = COALESCE((
    SELECT SUM(
      CASE
        WHEN transaction_type = 'penalty' THEN -ABS(points)
        ELSE points
      END
    )
    FROM public.eco_point_transactions
    WHERE user_id = _user_id
      AND status IN ('completed','synced_to_esenlink')
  ), 0),
  updated_at = now()
  WHERE id = _user_id;
$$;

-- Trigger function
CREATE OR REPLACE FUNCTION public.tg_eco_tx_sync_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.sync_profile_eco_balance(OLD.user_id);
    RETURN OLD;
  END IF;
  PERFORM public.sync_profile_eco_balance(NEW.user_id);
  IF TG_OP = 'UPDATE' AND OLD.user_id <> NEW.user_id THEN
    PERFORM public.sync_profile_eco_balance(OLD.user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS eco_tx_sync_balance ON public.eco_point_transactions;
CREATE TRIGGER eco_tx_sync_balance
AFTER INSERT OR UPDATE OR DELETE ON public.eco_point_transactions
FOR EACH ROW EXECUTE FUNCTION public.tg_eco_tx_sync_balance();

-- Write policies for eco_point_transactions
DROP POLICY IF EXISTS eco_tx_insert ON public.eco_point_transactions;
CREATE POLICY eco_tx_insert ON public.eco_point_transactions
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_staff_or_above(auth.uid()));

DROP POLICY IF EXISTS eco_tx_update_staff ON public.eco_point_transactions;
CREATE POLICY eco_tx_update_staff ON public.eco_point_transactions
FOR UPDATE TO authenticated
USING (public.is_staff_or_above(auth.uid()))
WITH CHECK (public.is_staff_or_above(auth.uid()));

DROP POLICY IF EXISTS eco_tx_delete_staff ON public.eco_point_transactions;
CREATE POLICY eco_tx_delete_staff ON public.eco_point_transactions
FOR DELETE TO authenticated
USING (public.is_staff_or_above(auth.uid()));

-- Backfill balances once
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT DISTINCT user_id FROM public.eco_point_transactions LOOP
    PERFORM public.sync_profile_eco_balance(r.user_id);
  END LOOP;
END $$;

-- Seed handover points if empty
INSERT INTO public.handover_points (name, type, address, neighborhood, opening_hours)
SELECT * FROM (VALUES
  ('Esenler Gençlik Merkezi', 'youth_center'::handover_point_type, 'Menderes Mah. Atışalanı Cd. No:1', 'Menderes', '09:00 - 21:00'),
  ('Atışalanı Halk Kütüphanesi', 'library'::handover_point_type, 'Atışalanı Mah. Park Cd. No:8', 'Atışalanı', '09:00 - 19:00'),
  ('Davutpaşa Hizmet Noktası', 'service_point'::handover_point_type, 'Davutpaşa Mah. İstasyon Cd. No:3', 'Davutpaşa', '08:30 - 17:30'),
  ('Oruçreis Kültür Merkezi', 'cultural_center'::handover_point_type, 'Oruçreis Mah. Kültür Cd. No:5', 'Oruçreis', '10:00 - 20:00'),
  ('Birlik Spor Tesisi', 'sports_facility'::handover_point_type, 'Birlik Mah. Spor Cd. No:12', 'Birlik', '09:00 - 22:00')
) AS v(name, type, address, neighborhood, opening_hours)
WHERE NOT EXISTS (SELECT 1 FROM public.handover_points);
