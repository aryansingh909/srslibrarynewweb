/*
# Add update_admin_password RPC

## Overview
Creates a SECURITY DEFINER function that updates the super admin's password.
Hashes the new password with bcrypt (gen_salt('bf', 12)).

## Notes
- SECURITY DEFINER so it can update the admins table.
- In production this should be scoped to the authenticated admin via a session token.
*/

CREATE OR REPLACE FUNCTION update_admin_password(new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

GRANT EXECUTE ON FUNCTION update_admin_password(text) TO anon, authenticated;
