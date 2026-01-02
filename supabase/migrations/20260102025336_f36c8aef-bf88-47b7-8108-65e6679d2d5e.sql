-- Drop the overly permissive staff viewing policies for financial data
DROP POLICY IF EXISTS "Staff can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Staff can view all pledges" ON public.pledges;

-- Create more restrictive policies: only treasurers and super_admins can view all financial records
CREATE POLICY "Treasurers and admins can view all payments"
ON public.payments
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'treasurer'::app_role)
);

CREATE POLICY "Treasurers and admins can view all pledges"
ON public.pledges
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'treasurer'::app_role)
);