-- Fix activity_logs: Only allow system/service role to insert, not any user
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;

-- Create a secure function for logging that uses service role context
CREATE OR REPLACE FUNCTION public.log_activity(
  _action text,
  _entity_type text,
  _entity_id uuid DEFAULT NULL,
  _details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, _details, NULL);
END;
$$;

-- Only super_admin can directly insert activity logs (for admin operations)
CREATE POLICY "Only admins can insert activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));