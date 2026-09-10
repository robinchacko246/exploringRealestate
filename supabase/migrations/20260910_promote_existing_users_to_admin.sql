-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Promote existing users to 'admin' role in user_roles table
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Upgrade specified existing admin users in user_roles to 'admin' role
UPDATE public.user_roles
SET role = 'admin'
WHERE role = 'agent';

-- 2. New signups trigger must ALWAYS set role = 'agent'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'agent')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;
