-- Add explicit policy to deny anonymous/unauthenticated access to profiles
CREATE POLICY "deny_anonymous_access" 
ON public.profiles 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add same protection to payments table
CREATE POLICY "deny_anonymous_access_payments" 
ON public.payments 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add same protection to other sensitive tables
CREATE POLICY "deny_anonymous_access_pledges" 
ON public.pledges 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "deny_anonymous_access_user_roles" 
ON public.user_roles 
FOR ALL 
USING (auth.uid() IS NOT NULL);