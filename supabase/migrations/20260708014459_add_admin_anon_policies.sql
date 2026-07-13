-- Allow anon (admin panel) to read all bookings, members, announcements, gallery, inquiries
-- The admin panel uses custom auth (not Supabase auth), so it always runs as anon role.

-- BOOKINGS: full access for anon (admin operations)
DROP POLICY IF EXISTS "anon_admin_read_bookings" ON bookings;
CREATE POLICY "anon_admin_read_bookings" ON bookings FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "anon_admin_update_bookings" ON bookings;
CREATE POLICY "anon_admin_update_bookings" ON bookings FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_admin_delete_bookings" ON bookings;
CREATE POLICY "anon_admin_delete_bookings" ON bookings FOR DELETE
  TO anon USING (true);

-- MEMBERS: full access for anon (admin operations)
DROP POLICY IF EXISTS "anon_admin_read_members" ON members;
CREATE POLICY "anon_admin_read_members" ON members FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "anon_admin_update_members" ON members;
CREATE POLICY "anon_admin_update_members" ON members FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_admin_delete_members" ON members;
CREATE POLICY "anon_admin_delete_members" ON members FOR DELETE
  TO anon USING (true);

-- ANNOUNCEMENTS: full access for anon (admin operations)
DROP POLICY IF EXISTS "anon_admin_read_announcements" ON announcements;
CREATE POLICY "anon_admin_read_announcements" ON announcements FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "anon_admin_insert_announcements" ON announcements;
CREATE POLICY "anon_admin_insert_announcements" ON announcements FOR INSERT
  TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_admin_update_announcements" ON announcements;
CREATE POLICY "anon_admin_update_announcements" ON announcements FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_admin_delete_announcements" ON announcements;
CREATE POLICY "anon_admin_delete_announcements" ON announcements FOR DELETE
  TO anon USING (true);

-- GALLERY: full access for anon (admin operations)
DROP POLICY IF EXISTS "anon_admin_insert_gallery" ON gallery_images;
CREATE POLICY "anon_admin_insert_gallery" ON gallery_images FOR INSERT
  TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_admin_update_gallery" ON gallery_images;
CREATE POLICY "anon_admin_update_gallery" ON gallery_images FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_admin_delete_gallery" ON gallery_images;
CREATE POLICY "anon_admin_delete_gallery" ON gallery_images FOR DELETE
  TO anon USING (true);

-- INQUIRIES: admin can read and update
DROP POLICY IF EXISTS "anon_admin_read_inquiries" ON inquiries;
CREATE POLICY "anon_admin_read_inquiries" ON inquiries FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "anon_admin_update_inquiries" ON inquiries;
CREATE POLICY "anon_admin_update_inquiries" ON inquiries FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

-- SITE SETTINGS: admin can update
DROP POLICY IF EXISTS "anon_admin_update_settings" ON site_settings;
CREATE POLICY "anon_admin_update_settings" ON site_settings FOR UPDATE
  TO anon USING (true) WITH CHECK (true);
