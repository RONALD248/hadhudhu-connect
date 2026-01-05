-- Add UPDATE policy for payments (treasurers and admins can update)
CREATE POLICY "Treasurers can update payments" 
ON public.payments 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role));

-- Add SELECT policy for secretaries to view profiles for member management
CREATE POLICY "Secretaries can view profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'secretary'::app_role));

-- Allow pastor to view limited profiles (name and basic info) for pastoral care
CREATE POLICY "Pastor can view profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'pastor'::app_role));