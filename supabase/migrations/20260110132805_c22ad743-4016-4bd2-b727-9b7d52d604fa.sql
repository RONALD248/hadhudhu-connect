-- Elder can view profiles (like pastor)
CREATE POLICY "Elder can view profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'elder'::app_role));

-- Elder can view all payments (read-only oversight)
CREATE POLICY "Elders can view all payments" 
ON public.payments 
FOR SELECT 
USING (has_role(auth.uid(), 'elder'::app_role));

-- Update is_staff function to include elder
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('super_admin', 'treasurer', 'secretary', 'pastor', 'elder')
  )
$$;