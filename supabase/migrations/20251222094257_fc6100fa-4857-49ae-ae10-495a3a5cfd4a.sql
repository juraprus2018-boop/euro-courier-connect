-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admins manage admin_users" ON public.admin_users;

-- Create a function to check admin status (security definer bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = check_user_id
  )
$$;

-- Allow authenticated users to check their own admin status
CREATE POLICY "Users can check own admin status"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to manage all admin_users
CREATE POLICY "Admins can manage admin_users"
ON public.admin_users
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));