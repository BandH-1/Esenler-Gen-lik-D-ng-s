
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('youth', 'verified_student', 'moderator', 'safe_point_staff', 'admin');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected', 'suspended');
CREATE TYPE public.school_type AS ENUM ('high_school', 'vocational_high_school', 'university', 'other');
CREATE TYPE public.esenler_connection AS ENUM ('residence', 'school', 'municipal_registry');
CREATE TYPE public.item_category AS ENUM ('books', 'exam_prep', 'clothes', 'school_supplies', 'electronics', 'sports', 'dormitory', 'other');
CREATE TYPE public.item_condition AS ENUM ('new', 'very_good', 'good', 'usable', 'needs_minor_repair');
CREATE TYPE public.item_status AS ENUM ('draft', 'pending_review', 'active', 'requested', 'reserved', 'qr_ready', 'completed', 'cancelled', 'rejected', 'removed');
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'rejected', 'needs_edit');
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'declined', 'expired', 'cancelled', 'converted_to_handover');
CREATE TYPE public.handover_status AS ENUM ('created', 'qr_ready', 'waiting_owner', 'waiting_receiver', 'waiting_staff', 'completed', 'failed', 'cancelled', 'expired');
CREATE TYPE public.handover_point_type AS ENUM ('youth_center', 'library', 'service_point', 'cultural_center', 'sports_facility', 'other');
CREATE TYPE public.transaction_type AS ENUM ('earned_from_giving', 'bonus', 'penalty', 'adjustment', 'integration_sync');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'synced_to_esenlink', 'failed');
CREATE TYPE public.report_reason AS ENUM ('inappropriate', 'fake_listing', 'unsafe_behavior', 'not_as_described', 'commercial_attempt', 'duplicate', 'other');
CREATE TYPE public.report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone_optional TEXT,
  school_type public.school_type,
  school_name TEXT,
  age_range TEXT,
  neighborhood TEXT,
  esenler_connection_type public.esenler_connection,
  verification_status public.verification_status NOT NULL DEFAULT 'unverified',
  eco_point_balance INTEGER NOT NULL DEFAULT 0,
  trust_score NUMERIC(3,2) NOT NULL DEFAULT 5.0,
  completed_gives INTEGER NOT NULL DEFAULT 0,
  completed_receives INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================================
-- USER ROLES (separate table — never on profiles)
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_above(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('moderator','admin','safe_point_staff')
  )
$$;

-- ============================================================
-- HANDOVER POINTS
-- ============================================================
CREATE TABLE public.handover_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.handover_point_type NOT NULL DEFAULT 'service_point',
  address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  opening_hours TEXT NOT NULL DEFAULT '09:00 - 18:00',
  qr_enabled BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  staff_contact_internal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.handover_points TO authenticated, anon;
GRANT ALL ON public.handover_points TO service_role;
ALTER TABLE public.handover_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "handover_points_public_read" ON public.handover_points FOR SELECT USING (active = true);

INSERT INTO public.handover_points (name, type, address, neighborhood, opening_hours) VALUES
('Esenler Gençlik Merkezi', 'youth_center', 'Davutpaşa Cd. No:12', 'Davutpaşa', '09:00 - 20:00'),
('Esenler Belediyesi Hizmet Binası', 'service_point', 'Atışalanı Cd. No:1', 'Atışalanı', '09:00 - 17:30'),
('Nene Hatun Kültür Merkezi', 'cultural_center', 'Birlik Cd. No:8', 'Birlik', '10:00 - 21:00'),
('Esenler Merkez Kütüphanesi', 'library', 'Menderes Cd. No:34', 'Menderes', '09:00 - 19:00'),
('Yavuz Selim Spor Tesisi', 'sports_facility', 'Yavuz Selim Mah.', 'Yavuz Selim', '08:00 - 22:00'),
('Oruçreis Mahalle Konağı', 'service_point', 'Oruçreis Mah. Fatih Cd.', 'Oruçreis', '09:00 - 18:00');

-- ============================================================
-- ITEMS
-- ============================================================
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category public.item_category NOT NULL,
  subcategory TEXT,
  condition public.item_condition NOT NULL DEFAULT 'good',
  images TEXT[] NOT NULL DEFAULT '{}',
  neighborhood TEXT NOT NULL,
  handover_point_id UUID REFERENCES public.handover_points(id),
  status public.item_status NOT NULL DEFAULT 'pending_review',
  eco_point_reward INTEGER NOT NULL DEFAULT 0,
  moderation_status public.moderation_status NOT NULL DEFAULT 'pending',
  moderation_note TEXT,
  ai_risk_flag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT SELECT ON public.items TO anon;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_public_active" ON public.items FOR SELECT
  USING (status IN ('active','requested','reserved','qr_ready'));
CREATE POLICY "items_owner_all" ON public.items FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "items_staff_all" ON public.items FOR SELECT TO authenticated USING (public.is_staff_or_above(auth.uid()));
CREATE POLICY "items_insert_own" ON public.items FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "items_update_own" ON public.items FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() AND status NOT IN ('reserved','qr_ready','completed'));
CREATE POLICY "items_update_staff" ON public.items FOR UPDATE TO authenticated USING (public.is_staff_or_above(auth.uid()));
CREATE POLICY "items_delete_own_or_staff" ON public.items FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.is_staff_or_above(auth.uid()));

-- ============================================================
-- ITEM ATTRIBUTES (flexible JSON)
-- ============================================================
CREATE TABLE public.item_attributes (
  item_id UUID PRIMARY KEY REFERENCES public.items(id) ON DELETE CASCADE,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_attributes TO authenticated;
GRANT SELECT ON public.item_attributes TO anon;
GRANT ALL ON public.item_attributes TO service_role;
ALTER TABLE public.item_attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "item_attributes_public_read" ON public.item_attributes FOR SELECT USING (true);
CREATE POLICY "item_attributes_owner_write" ON public.item_attributes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.items i WHERE i.id = item_id AND (i.owner_id = auth.uid() OR public.is_staff_or_above(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.items i WHERE i.id = item_id AND (i.owner_id = auth.uid() OR public.is_staff_or_above(auth.uid()))));

-- ============================================================
-- REQUESTS
-- ============================================================
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  note TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "requests_visible_to_parties" ON public.requests FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR owner_id = auth.uid() OR public.is_staff_or_above(auth.uid()));
CREATE POLICY "requests_create_self" ON public.requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());
CREATE POLICY "requests_update_parties" ON public.requests FOR UPDATE TO authenticated
  USING (requester_id = auth.uid() OR owner_id = auth.uid() OR public.is_staff_or_above(auth.uid()));

-- ============================================================
-- HANDOVERS
-- ============================================================
CREATE TABLE public.handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handover_point_id UUID NOT NULL REFERENCES public.handover_points(id),
  qr_code_owner TEXT NOT NULL,
  qr_code_receiver TEXT NOT NULL,
  security_code TEXT NOT NULL,
  status public.handover_status NOT NULL DEFAULT 'qr_ready',
  scheduled_window TEXT,
  owner_confirmed BOOLEAN NOT NULL DEFAULT false,
  receiver_confirmed BOOLEAN NOT NULL DEFAULT false,
  staff_confirmed BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.handovers TO authenticated;
GRANT ALL ON public.handovers TO service_role;
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "handovers_parties_select" ON public.handovers FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR receiver_id = auth.uid() OR public.is_staff_or_above(auth.uid()));
CREATE POLICY "handovers_parties_update" ON public.handovers FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR receiver_id = auth.uid() OR public.is_staff_or_above(auth.uid()));
CREATE POLICY "handovers_insert_owner" ON public.handovers FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_staff_or_above(auth.uid()));

-- ============================================================
-- ECO POINT TRANSACTIONS
-- ============================================================
CREATE TABLE public.eco_point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  handover_id UUID REFERENCES public.handovers(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  transaction_type public.transaction_type NOT NULL DEFAULT 'earned_from_giving',
  reason TEXT,
  status public.transaction_status NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.eco_point_transactions TO authenticated;
GRANT ALL ON public.eco_point_transactions TO service_role;
ALTER TABLE public.eco_point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eco_tx_own_select" ON public.eco_point_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff_or_above(auth.uid()));

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason public.report_reason NOT NULL,
  description TEXT,
  status public.report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_reporter_select" ON public.reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.is_staff_or_above(auth.uid()));
CREATE POLICY "reports_insert" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reports_staff_update" ON public.reports FOR UPDATE TO authenticated USING (public.is_staff_or_above(auth.uid()));

-- ============================================================
-- ECO POINT REWARD CALCULATION
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_eco_points(_category public.item_category, _condition public.item_condition)
RETURNS INTEGER LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE
  base INTEGER;
  mult NUMERIC;
  raw NUMERIC;
BEGIN
  base := CASE _category
    WHEN 'books' THEN 30
    WHEN 'exam_prep' THEN 40
    WHEN 'clothes' THEN 35
    WHEN 'school_supplies' THEN 25
    WHEN 'electronics' THEN 60
    WHEN 'sports' THEN 45
    WHEN 'dormitory' THEN 50
    ELSE 20
  END;
  mult := CASE _condition
    WHEN 'new' THEN 1.2
    WHEN 'very_good' THEN 1.1
    WHEN 'good' THEN 1.0
    WHEN 'usable' THEN 0.8
    WHEN 'needs_minor_repair' THEN 0.5
  END;
  raw := base * mult;
  RETURN ROUND(raw / 5.0) * 5;
END;
$$;

-- ============================================================
-- AUTO PROFILE + DEFAULT ROLE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'youth') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER items_touch BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER requests_touch BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
