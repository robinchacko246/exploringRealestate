-- ─────────────────────────────────────────────────────────────────────────────
-- Fix default user signup trigger: New users MUST default to 'agent' role
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- 1. Create user profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  -- 2. New signups are strictly assigned the 'agent' role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'agent')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;
