-- Update get_profiles_for_secretary function to include elder and treasurer roles
CREATE OR REPLACE FUNCTION public.get_profiles_for_secretary()
 RETURNS TABLE(id uuid, user_id uuid, first_name text, last_name text, phone text, membership_number text, is_active boolean, photo_url text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
     OR public.has_role(auth.uid(), 'pastor'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role)
     OR public.has_role(auth.uid(), 'elder'::app_role)
     OR public.has_role(auth.uid(), 'treasurer'::app_role)
$function$;