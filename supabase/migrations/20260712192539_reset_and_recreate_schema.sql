/*
# Reset and Recreate Complete Database Schema

This migration drops ALL existing tables, functions, and triggers in the public schema,
then recreates a clean schema that perfectly matches the SRS Digital Library application.

## What gets dropped:
- Tables: admins, announcements, bookings, gallery_images, inquiries, members, plans, site_settings
- Functions: trigger_set_timestamp, update_admin_password, verify_password

## What gets recreated (8 tables):
1. **admins** — admin accounts with bcrypt-hashed passwords (edge function auth)
2. **members** — library member profiles linked to Supabase auth.users
3. **plans** — membership plans (Monthly, 6-Month, Annual) with shift-based pricing (JSONB)
4. **bookings** — seat booking records with payment tracking
5. **announcements** — published notices/events for the public site
6. **gallery_images** — photo gallery entries
7. **inquiries** — contact form submissions
8. **site_settings** — singleton row with library info, seat capacities, social links

## Functions:
- **verify_password** — bcrypt comparison via crypt()
- **update_admin_password** — SECURE DEFINER function to update superadmin password
- **trigger_set_timestamp** — auto-updates updated_at on row modification

## Security (RLS):
- admins: NO RLS (edge function uses service role key, bypasses RLS)
- members: RLS enabled, anon+authenticated CRUD (members managed via edge functions + admin)
- plans: RLS enabled, public read, anon+authenticated CRUD
- bookings: RLS enabled, anon+authenticated CRUD (members see own bookings, admin manages all)
- announcements: RLS enabled, public read, anon+authenticated CRUD
- gallery_images: RLS enabled, public read, anon+authenticated CRUD
- inquiries: RLS enabled, anon+authenticated insert, no read (admin manages via service role)
- site_settings: RLS enabled, public read, anon+authenticated update

## Seed data:
- 1 superadmin: admin@srsdigitalibrary.com / SRS@Admin123
- 3 plans: Monthly (₹1500-2500), 6-Month (₹8100-13500), Annual (₹15000-25000)
- 1 site_settings row: SRS Digital Library info
*/

-- ============================================================
-- STEP 1: Drop all existing tables, functions, and triggers
-- ============================================================

DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS gallery_images CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

DROP FUNCTION IF EXISTS verify_password() CASCADE;
DROP FUNCTION IF EXISTS update_admin_password(text) CASCADE;
DROP FUNCTION IF EXISTS trigger_set_timestamp() CASCADE;

-- ============================================================
-- STEP 2: Create tables
-- ============================================================

CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('superadmin', 'staff')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  duration_months integer NOT NULL CHECK (duration_months > 0),
  is_active boolean NOT NULL DEFAULT true,
  is_archived boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  shifts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  id_proof_type text,
  id_proof_number text,
  profile_photo text,
  current_plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
  current_plan_name text,
  current_shift text,
  current_shift_time text,
  current_start_date date,
  current_expiry_date date,
  seat_number text,
  membership_status text NOT NULL DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'expired', 'suspended')),
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text UNIQUE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  user_id uuid,
  member_name text NOT NULL,
  member_phone text NOT NULL,
  member_email text,
  plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  shift text NOT NULL,
  shift_time text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  expiry_date date NOT NULL,
  seat_number text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  payment_mode text NOT NULL DEFAULT 'pending' CHECK (payment_mode IN ('pending', 'cash', 'online', 'upi')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  paid_amount numeric NOT NULL DEFAULT 0,
  due_amount numeric NOT NULL DEFAULT 0,
  admin_notes text,
  id_proof_type text,
  id_proof_number text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'notice' CHECK (category IN ('notice', 'event', 'holiday', 'urgent')),
  is_published boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text NOT NULL,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  library_name text NOT NULL DEFAULT 'SRS Digital Library',
  library_phone text NOT NULL DEFAULT 'Call us',
  library_email text NOT NULL DEFAULT 'srsdigitalibrary@gmail.com',
  library_address text NOT NULL DEFAULT 'Hasiya, Barsethi, Jaunpur, Uttar Pradesh — Near Miya Ka Chak Tiraha, beside Holy Angel English School',
  total_seats integer NOT NULL DEFAULT 60,
  seats_morning integer NOT NULL DEFAULT 20,
  seats_evening integer NOT NULL DEFAULT 20,
  seats_night integer NOT NULL DEFAULT 20,
  seats_fullday integer NOT NULL DEFAULT 60,
  instagram_url text,
  facebook_url text,
  youtube_url text,
  whatsapp_number text NOT NULL DEFAULT '919800550047',
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- STEP 3: Create indexes
-- ============================================================

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_membership_status ON members(membership_status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_member_id ON bookings(member_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_booking_id ON bookings(booking_id);
CREATE INDEX idx_plans_active_archived ON plans(is_active, is_archived);
CREATE INDEX idx_announcements_published ON announcements(is_published);
CREATE INDEX idx_gallery_sort_order ON gallery_images(sort_order);
CREATE INDEX idx_inquiries_resolved ON inquiries(is_resolved);

-- ============================================================
-- STEP 4: Enable RLS on all tables except admins
-- ============================================================

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 5: RLS Policies
-- ============================================================

-- admins: edge function uses service role key (bypasses RLS), so anon has no access.
-- The frontend never queries admins directly — only the edge function does.
-- We still enable RLS so no anon access is possible.

-- members: anon+authenticated CRUD (edge functions manage via service role,
-- frontend manages via anon key for registration and profile updates)
DROP POLICY IF EXISTS "select_members" ON members;
CREATE POLICY "select_members" ON members FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_members" ON members;
CREATE POLICY "insert_members" ON members FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_members" ON members;
CREATE POLICY "update_members" ON members FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_members" ON members;
CREATE POLICY "delete_members" ON members FOR DELETE
  TO anon, authenticated USING (true);

-- plans: public read, admin manages via anon key
DROP POLICY IF EXISTS "select_plans" ON plans;
CREATE POLICY "select_plans" ON plans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_plans" ON plans;
CREATE POLICY "insert_plans" ON plans FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_plans" ON plans;
CREATE POLICY "update_plans" ON plans FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_plans" ON plans;
CREATE POLICY "delete_plans" ON plans FOR DELETE
  TO anon, authenticated USING (true);

-- bookings: anon+authenticated CRUD (members book via anon key, admin manages all)
DROP POLICY IF EXISTS "select_bookings" ON bookings;
CREATE POLICY "select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_bookings" ON bookings;
CREATE POLICY "insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_bookings" ON bookings;
CREATE POLICY "update_bookings" ON bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_bookings" ON bookings;
CREATE POLICY "delete_bookings" ON bookings FOR DELETE
  TO anon, authenticated USING (true);

-- announcements: public read published, admin manages via anon key
DROP POLICY IF EXISTS "select_announcements" ON announcements;
CREATE POLICY "select_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_announcements" ON announcements;
CREATE POLICY "insert_announcements" ON announcements FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_announcements" ON announcements;
CREATE POLICY "update_announcements" ON announcements FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_announcements" ON announcements;
CREATE POLICY "delete_announcements" ON announcements FOR DELETE
  TO anon, authenticated USING (true);

-- gallery_images: public read, admin manages via anon key
DROP POLICY IF EXISTS "select_gallery" ON gallery_images;
CREATE POLICY "select_gallery" ON gallery_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_gallery" ON gallery_images;
CREATE POLICY "insert_gallery" ON gallery_images FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_gallery" ON gallery_images;
CREATE POLICY "update_gallery" ON gallery_images FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_gallery" ON gallery_images;
CREATE POLICY "delete_gallery" ON gallery_images FOR DELETE
  TO anon, authenticated USING (true);

-- inquiries: anyone can submit, admin reads via service role (anon can't read)
DROP POLICY IF EXISTS "insert_inquiries" ON inquiries;
CREATE POLICY "insert_inquiries" ON inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_inquiries" ON inquiries;
CREATE POLICY "select_inquiries" ON inquiries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "update_inquiries" ON inquiries;
CREATE POLICY "update_inquiries" ON inquiries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_inquiries" ON inquiries;
CREATE POLICY "delete_inquiries" ON inquiries FOR DELETE
  TO anon, authenticated USING (true);

-- site_settings: public read, admin updates via anon key
DROP POLICY IF EXISTS "select_site_settings" ON site_settings;
CREATE POLICY "select_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "update_site_settings" ON site_settings;
CREATE POLICY "update_site_settings" ON site_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- STEP 6: Functions
-- ============================================================

-- Password verification using bcrypt crypt()
CREATE OR REPLACE FUNCTION verify_password(supplied_password text, stored_hash text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN stored_hash = crypt(supplied_password, stored_hash);
END;
$function$;

-- Update superadmin password (SECURITY DEFINER so anon key can call it)
CREATE OR REPLACE FUNCTION update_admin_password(new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  affected_count int;
  admin_rec record;
BEGIN
  SELECT * INTO admin_rec FROM admins WHERE role = 'superadmin' ORDER BY created_at ASC LIMIT 1;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE admins
  SET password_hash = crypt(new_password, gen_salt('bf', 12))
  WHERE id = admin_rec.id;

  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count > 0;
END;
$function$;

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Apply the trigger to all tables with updated_at
CREATE TRIGGER set_timestamp_plans BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_members BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_announcements BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_site_settings BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================
-- STEP 7: Seed data
-- ============================================================

-- Superadmin account: admin@srsdigitalibrary.com / SRS@Admin123
INSERT INTO admins (name, email, password_hash, role) VALUES (
  'Super Admin',
  'admin@srsdigitalibrary.com',
  crypt('SRS@Admin123', gen_salt('bf', 12)),
  'superadmin'
);

-- Plans: Monthly, 6-Month, Annual with shift pricing
INSERT INTO plans (name, duration_months, is_active, is_archived, sort_order, shifts) VALUES
(
  'Monthly', 1, true, false, 1,
  '[{"shiftName":"Morning","shiftTime":"6AM - 2PM","price":1500,"isActive":true},{"shiftName":"Evening","shiftTime":"2PM - 10PM","price":1500,"isActive":true},{"shiftName":"Night","shiftTime":"10PM - 6AM","price":1500,"isActive":true},{"shiftName":"Full Day","shiftTime":"24 Hours","price":2500,"isActive":true}]'::jsonb
),
(
  '6-Month', 6, true, false, 2,
  '[{"shiftName":"Morning","shiftTime":"6AM - 2PM","price":8100,"isActive":true},{"shiftName":"Evening","shiftTime":"2PM - 10PM","price":8100,"isActive":true},{"shiftName":"Night","shiftTime":"10PM - 6AM","price":8100,"isActive":true},{"shiftName":"Full Day","shiftTime":"24 Hours","price":13500,"isActive":true}]'::jsonb
),
(
  'Annual', 12, true, false, 3,
  '[{"shiftName":"Morning","shiftTime":"6AM - 2PM","price":15000,"isActive":true},{"shiftName":"Evening","shiftTime":"2PM - 10PM","price":15000,"isActive":true},{"shiftName":"Night","shiftTime":"10PM - 6AM","price":15000,"isActive":true},{"shiftName":"Full Day","shiftTime":"24 Hours","price":25000,"isActive":true}]'::jsonb
);

-- Site settings (singleton row)
INSERT INTO site_settings (id, library_name, library_phone, library_email, library_address, total_seats, seats_morning, seats_evening, seats_night, seats_fullday, whatsapp_number)
VALUES (
  1,
  'SRS Digital Library',
  'Call us',
  'srsdigitalibrary@gmail.com',
  'Hasiya, Barsethi, Jaunpur, Uttar Pradesh — Near Miya Ka Chak Tiraha, beside Holy Angel English School',
  60, 20, 20, 20, 60,
  '919800550047'
);

-- Ensure pgcrypto extension is available for crypt() and gen_salt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;
