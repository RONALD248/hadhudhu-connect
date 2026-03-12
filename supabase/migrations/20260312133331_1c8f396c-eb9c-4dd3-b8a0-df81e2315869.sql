
-- Drop all existing broken RESTRICTIVE policies on payment_confirmations
DROP POLICY IF EXISTS "Secretaries can update confirmations" ON public.payment_confirmations;
DROP POLICY IF EXISTS "Secretaries can view confirmations" ON public.payment_confirmations;
DROP POLICY IF EXISTS "Staff can view confirmations" ON public.payment_confirmations;
DROP POLICY IF EXISTS "Super admin can delete confirmations" ON public.payment_confirmations;
DROP POLICY IF EXISTS "Treasurers can manage confirmations" ON public.payment_confirmations;
DROP POLICY IF EXISTS "deny_anonymous_access_confirmations" ON public.payment_confirmations;

-- Recreate as PERMISSIVE policies (at least one must pass)

-- Block anonymous access
CREATE POLICY "deny_anonymous_access_confirmations"
ON public.payment_confirmations FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Staff (treasurer, secretary, admin, pastor, elder) can view all confirmations
CREATE POLICY "Staff can view confirmations"
ON public.payment_confirmations FOR SELECT
TO public
USING (is_staff(auth.uid()));

-- Members can view confirmations for their own payments
CREATE POLICY "Members can view own confirmations"
ON public.payment_confirmations FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.id = payment_confirmations.payment_id
    AND p.user_id = auth.uid()
  )
);

-- Treasurers and admins can insert/update/delete confirmations
CREATE POLICY "Treasurers can manage confirmations"
ON public.payment_confirmations FOR ALL
TO public
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role)
);

-- Secretaries can update confirmations (for review step)
CREATE POLICY "Secretaries can update confirmations"
ON public.payment_confirmations FOR UPDATE
TO public
USING (has_role(auth.uid(), 'secretary'::app_role));
