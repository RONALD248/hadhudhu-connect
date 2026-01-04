-- Drop the existing ALL policy for treasurers (which allows UPDATE/DELETE)
DROP POLICY IF EXISTS "Treasurers can manage payments" ON public.payments;

-- Create INSERT-only policy for treasurers (financial records should be immutable)
CREATE POLICY "Treasurers can insert payments"
ON public.payments
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.has_role(auth.uid(), 'treasurer'::app_role)
);

-- Note: The existing SELECT policies remain:
-- "Users can view their own payments" - allows members to see their own
-- "Treasurers and admins can view all payments" - allows staff to view all
-- "deny_anonymous_access_payments" - blocks anonymous access

-- No UPDATE or DELETE policies = payments are immutable for audit trail