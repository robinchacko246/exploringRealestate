-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Promote existing users to 'admin' role in user_roles table
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Upgrade all existing users in user_roles to 'admin' role
UPDATE public.user_roles
SET role = 'admin'
WHERE role = 'agent';

-- 2. Ensure every user in auth.users has an 'admin' role record
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';

-- 3. (Optional) Update trigger so new user signups also get 'admin' role by default if desired
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';

  RETURN NEW;
END;
$$;
