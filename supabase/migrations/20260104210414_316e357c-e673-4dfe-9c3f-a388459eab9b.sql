-- Drop the existing secretary policy that gives full access
DROP POLICY IF EXISTS "Admins and secretaries can view all profiles" ON public.profiles;

-- Create policy: Only super_admin can view ALL profile fields
CREATE POLICY "Only super_admin can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Create a secure view with limited fields for secretaries
CREATE OR REPLACE VIEW public.profiles_limited AS
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  phone,
  membership_number,
  is_active,
  photo_url,
  created_at,
  updated_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.profiles_limited SET (security_invoker = on);

-- Grant access to the view
GRANT SELECT ON public.profiles_limited TO authenticated;

-- Create a function for secretaries to access limited profile data
CREATE OR REPLACE FUNCTION public.get_profiles_for_secretary()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  phone text,
  membership_number text,
  is_active boolean,
  photo_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    user_id,
    first_name,
    last_name,
    phone,
    membership_number,
    is_active,
    photo_url,
    created_at,
    updated_at
  FROM public.profiles
  WHERE public.has_role(auth.uid(), 'secretary'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role)
$$;