-- Drop the existing view and recreate with security_invoker
DROP VIEW IF EXISTS public.profiles_limited;

CREATE VIEW public.profiles_limited
WITH (security_invoker = on)
AS
SELECT 
  id,
  user_id,
  is_active,
  created_at,
  updated_at,
  phone,
  membership_number,
  photo_url,
  first_name,
  last_name
FROM public.profiles;