
-- 1) Convert overly-permissive "deny_anonymous_access" PERMISSIVE ALL policies into RESTRICTIVE policies.
-- Postgres OR's permissive policies, so a permissive policy with USING (auth.uid() IS NOT NULL)
-- effectively granted every authenticated user full access. Restrictive policies AND with the
-- other permissive policies, restoring intended row-level scoping.

-- profiles
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.profiles;
CREATE POLICY "require_auth_profiles" ON public.profiles
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- user_roles
DROP POLICY IF EXISTS "deny_anonymous_access_user_roles" ON public.user_roles;
CREATE POLICY "require_auth_user_roles" ON public.user_roles
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- approved_role_emails
DROP POLICY IF EXISTS "deny_anonymous_access_approved_emails" ON public.approved_role_emails;
CREATE POLICY "require_auth_approved_emails" ON public.approved_role_emails
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- attendance_records
DROP POLICY IF EXISTS "deny_anonymous_attendance" ON public.attendance_records;
CREATE POLICY "require_auth_attendance" ON public.attendance_records
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- church_services
DROP POLICY IF EXISTS "deny_anonymous_services" ON public.church_services;
CREATE POLICY "require_auth_services" ON public.church_services
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- payment_confirmations
DROP POLICY IF EXISTS "deny_anonymous_access_confirmations" ON public.payment_confirmations;
CREATE POLICY "require_auth_confirmations" ON public.payment_confirmations
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- payment_settings
DROP POLICY IF EXISTS "deny_anonymous_access_payment_settings" ON public.payment_settings;
CREATE POLICY "require_auth_payment_settings" ON public.payment_settings
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- payments
DROP POLICY IF EXISTS "deny_anonymous_access_payments" ON public.payments;
CREATE POLICY "require_auth_payments" ON public.payments
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- pledges
DROP POLICY IF EXISTS "deny_anonymous_access_pledges" ON public.pledges;
CREATE POLICY "require_auth_pledges" ON public.pledges
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- activity_logs
DROP POLICY IF EXISTS "Deny anonymous access to activity_logs" ON public.activity_logs;
CREATE POLICY "require_auth_activity_logs" ON public.activity_logs
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2) Revoke EXECUTE from anon on SECURITY DEFINER helper functions; these should only
-- be callable by signed-in users (or only by triggers).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.log_activity(text, text, uuid, jsonb) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_profiles_for_secretary() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_my_confirmed_receipts() FROM anon, public;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity(text, text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profiles_for_secretary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_confirmed_receipts() TO authenticated;
