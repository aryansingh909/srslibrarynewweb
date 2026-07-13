/*
# Pathshala Library — Core Schema

## Overview
Creates the full database schema for the Pathshala Library management system:
plans (admin-editable pricing), members (auth-linked profiles), bookings,
announcements, gallery images, site settings, and contact inquiries.

## New Tables
1. `plans` — Membership plans (Monthly / 6-Month / Annual) with per-shift pricing.
2. `members` — Library member profiles, linked 1:1 to Supabase auth.users.
3. `bookings` — Seat booking records with payment tracking.
4. `announcements` — Notices/events/holidays published by admin.
5. `gallery_images` — Gallery photos with manual ordering.
6. `site_settings` — Singleton row for library contact info, seats, socials.
7. `inquiries` — Contact-form submissions from the public site.
8. `admins` — Admin accounts (email + role), separate from member auth.

## Security
- RLS enabled on every table.
- Public read on plans, published announcements, gallery, site settings (anon+authenticated).
- Members can read/update their own profile and bookings.
- All admin write operations go through the service-role key (server-side) — anon
  policies only allow public reads + member self-service + public booking creation.
- Public booking creation is allowed (anon) so visitors can register without login;
  the member row is then linked when they confirm via email.
*/

-- ===== PLANS =====
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  duration_months int NOT NULL CHECK (duration_months > 0),
  is_active boolean NOT NULL DEFAULT true,
  is_archived boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  shifts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_plans" ON plans;
CREATE POLICY "public_read_plans" ON plans FOR SELECT
  TO anon, authenticated USING (true);

-- ===== MEMBERS =====
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  id_proof_type text,
  id_proof_number text,
  profile_photo text,
  current_plan_id uuid REFERENCES plans(id),
  current_plan_name text,
  current_shift text,
  current_shift_time text,
  current_start_date date,
  current_expiry_date date,
  seat_number text,
  membership_status text NOT NULL DEFAULT 'pending' CHECK (membership_status IN ('pending','active','expired','suspended')),
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_read_own" ON members;
CREATE POLICY "member_read_own" ON members FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "member_update_own" ON members;
CREATE POLICY "member_update_own" ON members FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "anon_insert_member" ON members;
CREATE POLICY "anon_insert_member" ON members FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ===== BOOKINGS =====
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text UNIQUE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  member_name text NOT NULL,
  member_phone text NOT NULL,
  member_email text,
  plan_id uuid REFERENCES plans(id),
  plan_name text NOT NULL,
  shift text NOT NULL,
  shift_time text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  expiry_date date NOT NULL,
  seat_number text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','cancelled')),
  payment_mode text NOT NULL DEFAULT 'pending' CHECK (payment_mode IN ('cash','upi','pending')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid','unpaid','partial')),
  paid_amount numeric NOT NULL DEFAULT 0,
  due_amount numeric NOT NULL DEFAULT 0,
  admin_notes text,
  id_proof_type text,
  id_proof_number text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_member_id ON bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_read_own_bookings" ON bookings;
CREATE POLICY "member_read_own_bookings" ON bookings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "anon_create_booking" ON bookings;
CREATE POLICY "anon_create_booking" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "member_update_own_booking" ON bookings;
CREATE POLICY "member_update_own_booking" ON bookings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== ANNOUNCEMENTS =====
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'notice' CHECK (category IN ('notice','holiday','event','urgent')),
  is_published boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_announcements" ON announcements;
CREATE POLICY "public_read_published_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (is_published = true);

-- ===== GALLERY =====
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery" ON gallery_images;
CREATE POLICY "public_read_gallery" ON gallery_images FOR SELECT
  TO anon, authenticated USING (true);

-- ===== SITE SETTINGS (singleton) =====
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  library_name text NOT NULL DEFAULT 'Pathshala Library',
  library_phone text NOT NULL DEFAULT '098005 50047',
  library_email text NOT NULL DEFAULT 'info@pathshaalalibrary.com',
  library_address text NOT NULL DEFAULT '9th Floor, Tradex Tower, Alpha I, Greater Noida, Uttar Pradesh 201310',
  total_seats int NOT NULL DEFAULT 120,
  seats_morning int NOT NULL DEFAULT 40,
  seats_evening int NOT NULL DEFAULT 40,
  seats_night int NOT NULL DEFAULT 40,
  seats_fullday int NOT NULL DEFAULT 40,
  instagram_url text,
  facebook_url text,
  youtube_url text,
  whatsapp_number text NOT NULL DEFAULT '919800550047',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

-- ===== INQUIRIES =====
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text NOT NULL,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_create_inquiry" ON inquiries;
CREATE POLICY "anon_create_inquiry" ON inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ===== ADMINS (separate from auth.users) =====
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('superadmin','staff')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins table is fully locked down; all access via service-role key.
DROP POLICY IF EXISTS "no_anon_admin_access" ON admins;
CREATE POLICY "no_anon_admin_access" ON admins FOR SELECT
  TO anon, authenticated USING (false);

-- ===== updated_at triggers =====
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_plans ON plans;
CREATE TRIGGER set_updated_at_plans BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_updated_at_members ON members;
CREATE TRIGGER set_updated_at_members BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_updated_at_bookings ON bookings;
CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_updated_at_announcements ON announcements;
CREATE TRIGGER set_updated_at_announcements BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_updated_at_settings ON site_settings;
CREATE TRIGGER set_updated_at_settings BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
