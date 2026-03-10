
-- Allow super_admin to delete payment confirmations
CREATE POLICY "Super admin can delete confirmations"
ON public.payment_confirmations
FOR DELETE
TO public
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super_admin to delete payments
CREATE POLICY "Super admin can delete payments"
ON public.payments
FOR DELETE
TO public
USING (has_role(auth.uid(), 'super_admin'::app_role));
