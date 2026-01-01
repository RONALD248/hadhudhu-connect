-- Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix departments RLS - restrict to staff only instead of all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view departments" ON public.departments;

CREATE POLICY "Staff can view departments" 
ON public.departments 
FOR SELECT 
USING (is_staff(auth.uid()));

-- Create payment_settings table for M-Pesa and payment instructions
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on payment_settings
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Only treasurers and super_admin can manage payment settings
CREATE POLICY "Treasurers can manage payment settings" 
ON public.payment_settings 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role));

-- Staff can view payment settings (for accountability)
CREATE POLICY "Staff can view payment settings" 
ON public.payment_settings 
FOR SELECT 
USING (is_staff(auth.uid()));

-- Deny anonymous access
CREATE POLICY "deny_anonymous_access_payment_settings" 
ON public.payment_settings 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default M-Pesa settings
INSERT INTO public.payment_settings (setting_key, setting_value, description)
VALUES 
  ('mpesa_paybill', '', 'M-Pesa Paybill Number'),
  ('mpesa_account', '', 'M-Pesa Account Number'),
  ('mpesa_instructions', 'Go to M-Pesa > Lipa na M-Pesa > Pay Bill. Enter the Paybill number, your Account number, and the amount.', 'Payment instructions for members'),
  ('bank_name', '', 'Bank Name for transfers'),
  ('bank_account', '', 'Bank Account Number'),
  ('bank_instructions', '', 'Bank transfer instructions');