-- ─────────────────────────────────────────────────────────────────────────────
-- Admin Portal RLS Policies & Helper Functions
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper function to check if current or specified user has 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- Helper function to check if user has admin or manager role
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role IN ('admin', 'manager')
  );
$$;

-- Allow admins to view all profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
      ON public.profiles FOR SELECT
      USING (public.is_admin_or_manager());
  END IF;
END $$;

-- Allow admins to update all profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can update profiles'
  ) THEN
    CREATE POLICY "Admins can update profiles"
      ON public.profiles FOR UPDATE
      USING (public.is_admin());
  END IF;
END $$;

-- Allow admins to view all user roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can view all roles'
  ) THEN
    CREATE POLICY "Admins can view all roles"
      ON public.user_roles FOR SELECT
      USING (public.is_admin_or_manager());
  END IF;
END $$;

-- Allow admins to insert and modify user roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage roles'
  ) THEN
    CREATE POLICY "Admins can manage roles"
      ON public.user_roles FOR ALL
      USING (public.is_admin());
  END IF;
END $$;

-- Allow admins to manage all public_property_listings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'public_property_listings' AND policyname = 'Admins manage public listings'
  ) THEN
    CREATE POLICY "Admins manage public listings"
      ON public.public_property_listings FOR ALL
      USING (public.is_admin_or_manager());
  END IF;
END $$;

-- Allow admins to view all subscriptions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Admins view all subscriptions'
  ) THEN
    CREATE POLICY "Admins view all subscriptions"
      ON public.subscriptions FOR SELECT
      USING (public.is_admin_or_manager());
  END IF;
END $$;

-- Allow admins to update subscriptions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Admins update subscriptions'
  ) THEN
    CREATE POLICY "Admins update subscriptions"
      ON public.subscriptions FOR UPDATE
      USING (public.is_admin());
  END IF;
END $$;

-- Allow admins to view all properties
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Admins view all properties'
  ) THEN
    CREATE POLICY "Admins view all properties"
      ON public.properties FOR SELECT
      USING (public.is_admin_or_manager());
  END IF;
END $$;
