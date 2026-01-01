-- Drop the overly permissive staff policy
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;

-- Create new policy: Only super_admin and secretary can view all profiles
CREATE POLICY "Admins and secretaries can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'secretary'::app_role)
);

-- Create policy for secretary to insert profiles (register members)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users and secretaries can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'secretary'::app_role)
);

-- Update policy: Only super_admin, secretary, and owner can update profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users secretaries and admins can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'secretary'::app_role)
);