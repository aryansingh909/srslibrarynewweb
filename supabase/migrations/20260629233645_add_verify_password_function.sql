/*
# Add verify_password helper function

## Overview
Creates a Postgres function `verify_password(supplied_password text, stored_hash text)`
that returns true when the supplied password matches the bcrypt hash stored in
the admins table. Used by the admin-login edge function to verify credentials
server-side without exposing the hash to the client.

## Security
- The function is SECURITY DEFINER so it can run crypt() with the anon role.
- Marked as a stable function (no side effects).
*/

CREATE OR REPLACE FUNCTION verify_password(supplied_password text, stored_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN supplied_hash = crypt(supplied_password, stored_hash);
END;
$$;

-- Fix: correct variable name
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
