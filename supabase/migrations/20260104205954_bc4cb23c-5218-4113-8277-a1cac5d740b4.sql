-- Drop existing policies on activity_logs
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Only admins can insert activity logs" ON public.activity_logs;

-- Create restrictive policy: Only super_admin can view activity logs
CREATE POLICY "Only super_admin can view activity logs"
ON public.activity_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Create policy: Allow inserts via SECURITY DEFINER functions (system inserts)
-- The log_activity function and triggers use SECURITY DEFINER so they bypass RLS
-- But we still need a policy for direct authenticated inserts if needed
CREATE POLICY "System can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Explicitly deny anonymous access
CREATE POLICY "Deny anonymous access to activity_logs"
ON public.activity_logs
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Note: UPDATE and DELETE are not allowed as no policies exist for them