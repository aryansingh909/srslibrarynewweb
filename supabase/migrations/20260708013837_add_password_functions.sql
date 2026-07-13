CREATE OR REPLACE FUNCTION verify_password(supplied_password text, stored_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN stored_hash = crypt(supplied_password, stored_hash);
END;
$$;

GRANT EXECUTE ON FUNCTION verify_password(text, text) TO anon, authenticated;

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
