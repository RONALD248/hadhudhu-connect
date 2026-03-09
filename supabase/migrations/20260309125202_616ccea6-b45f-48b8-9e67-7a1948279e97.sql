
-- Create payment_confirmations table to track treasurer/secretary dual approval
CREATE TABLE public.payment_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  treasurer_user_id uuid,
  treasurer_confirmed_at timestamptz,
  secretary_user_id uuid,
  secretary_confirmed_at timestamptz,
  receipt_sent boolean NOT NULL DEFAULT false,
  receipt_sent_at timestamptz,
  receipt_number text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(payment_id)
);

-- Enable RLS
ALTER TABLE public.payment_confirmations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "deny_anonymous_access_confirmations" ON public.payment_confirmations
  AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can view confirmations" ON public.payment_confirmations
  AS RESTRICTIVE FOR SELECT TO public USING (is_staff(auth.uid()));

CREATE POLICY "Treasurers can manage confirmations" ON public.payment_confirmations
  AS RESTRICTIVE FOR ALL TO public
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role));

CREATE POLICY "Secretaries can update confirmations" ON public.payment_confirmations
  AS RESTRICTIVE FOR UPDATE TO public
  USING (has_role(auth.uid(), 'secretary'::app_role));

CREATE POLICY "Secretaries can view confirmations" ON public.payment_confirmations
  AS RESTRICTIVE FOR SELECT TO public
  USING (has_role(auth.uid(), 'secretary'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_payment_confirmations_updated_at
  BEFORE UPDATE ON public.payment_confirmations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
