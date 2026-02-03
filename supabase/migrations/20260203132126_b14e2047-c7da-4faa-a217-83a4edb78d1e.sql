-- Fix 1: Update events SELECT policy to require authentication instead of public access
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON public.events;
CREATE POLICY "Events are viewable by authenticated users" 
ON public.events 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix 2: Add RLS policies to the profiles_limited view
-- First, we need to recreate the view with security_invoker to respect RLS
DROP VIEW IF EXISTS public.profiles_limited;
CREATE VIEW public.profiles_limited
WITH (security_invoker = on)
AS SELECT 
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