
-- 1. PROFILES: restrict sensitive fields to owner+staff; public view for safe fields
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
CREATE POLICY profiles_select_own_or_staff ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff_or_above(auth.uid()));

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT id, full_name, school_type, verification_status,
         trust_score, eco_point_balance, completed_gives, completed_receives, created_at
  FROM public.profiles;
GRANT SELECT ON public.profiles_public TO authenticated, anon;

-- 2. ECO POINT TRANSACTIONS: remove self-insert; staff only
DROP POLICY IF EXISTS eco_tx_insert ON public.eco_point_transactions;
CREATE POLICY eco_tx_insert_staff ON public.eco_point_transactions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_or_above(auth.uid()));

-- 3. HANDOVERS: hide opposing party's QR/security code via view
DROP POLICY IF EXISTS handovers_parties_select ON public.handovers;
CREATE POLICY handovers_staff_select ON public.handovers
  FOR SELECT TO authenticated
  USING (public.is_staff_or_above(auth.uid()));

CREATE OR REPLACE VIEW public.handovers_my AS
  SELECT id, item_id, request_id, owner_id, receiver_id, handover_point_id,
         status, scheduled_window, created_at, completed_at,
         owner_confirmed, receiver_confirmed, staff_confirmed, failure_reason,
         CASE WHEN owner_id = auth.uid() OR public.is_staff_or_above(auth.uid())
              THEN qr_code_owner END AS qr_code_owner,
         CASE WHEN receiver_id = auth.uid() OR public.is_staff_or_above(auth.uid())
              THEN qr_code_receiver END AS qr_code_receiver,
         CASE WHEN receiver_id = auth.uid() OR public.is_staff_or_above(auth.uid())
              THEN security_code END AS security_code
  FROM public.handovers
  WHERE owner_id = auth.uid()
     OR receiver_id = auth.uid()
     OR public.is_staff_or_above(auth.uid());
GRANT SELECT ON public.handovers_my TO authenticated;

-- 4. ITEMS: hide moderation metadata from anonymous public reads via column grants
REVOKE SELECT ON public.items FROM anon;
GRANT SELECT (id, owner_id, title, description, category, subcategory, condition,
              images, neighborhood, handover_point_id, status, eco_point_reward,
              created_at, updated_at) ON public.items TO anon;

-- 5. Lock down SECURITY DEFINER helpers not meant for direct client calls
REVOKE EXECUTE ON FUNCTION public.sync_profile_eco_balance(uuid) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.tg_eco_tx_sync_balance() FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, authenticated, anon;
