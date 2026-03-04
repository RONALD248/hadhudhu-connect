
-- Fix profiles table: Convert permission-granting policies from RESTRICTIVE to PERMISSIVE
-- The issue: ALL policies are restrictive, but PostgreSQL requires at least one permissive policy to grant access

-- Drop the restrictive permission policies and recreate as permissive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users and secretaries can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users secretaries and admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only super_admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Secretaries can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Pastor can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Elder can view profiles" ON public.profiles;

-- Recreate as PERMISSIVE (default) so they grant access
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users and secretaries can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id) 
    OR has_role(auth.uid(), 'super_admin'::app_role) 
    OR has_role(auth.uid(), 'secretary'::app_role)
  );

CREATE POLICY "Users secretaries and admins can update profiles" ON public.profiles
  FOR UPDATE USING (
    (auth.uid() = user_id) 
    OR has_role(auth.uid(), 'super_admin'::app_role) 
    OR has_role(auth.uid(), 'secretary'::app_role)
  );

CREATE POLICY "Only super_admin can view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Secretaries can view profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'secretary'::app_role));

CREATE POLICY "Pastor can view profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'pastor'::app_role));

CREATE POLICY "Elder can view profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'elder'::app_role));

-- Keep deny_anonymous_access as RESTRICTIVE (it already is) - this is correct
-- It acts as a guard: all other permissive policies must ALSO pass the anonymous check

-- Also fix other tables that may have the same issue
-- Fix user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Fix payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Treasurers and admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Treasurers can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Treasurers can update payments" ON public.payments;
DROP POLICY IF EXISTS "Elders can view all payments" ON public.payments;

CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Treasurers and admins can view all payments" ON public.payments
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role));

CREATE POLICY "Treasurers can insert payments" ON public.payments
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role));

CREATE POLICY "Treasurers can update payments" ON public.payments
  FOR UPDATE USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role));

CREATE POLICY "Elders can view all payments" ON public.payments
  FOR SELECT USING (has_role(auth.uid(), 'elder'::app_role));

-- Fix pledges
DROP POLICY IF EXISTS "Users can view their own pledges" ON public.pledges;
DROP POLICY IF EXISTS "Users can manage their own pledges" ON public.pledges;
DROP POLICY IF EXISTS "Treasurers can manage all pledges" ON public.pledges;
DROP POLICY IF EXISTS "Treasurers and admins can view all pledges" ON public.pledges;

CREATE POLICY "Users can view their own pledges" ON public.pledges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own pledges" ON public.pledges
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Treasurers can manage all pledges" ON public.pledges
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role));

CREATE POLICY "Treasurers and admins can view all pledges" ON public.pledges
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role));

-- Fix attendance_records
DROP POLICY IF EXISTS "Staff can manage attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance_records;

CREATE POLICY "Staff can manage attendance" ON public.attendance_records
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'secretary'::app_role) OR has_role(auth.uid(), 'pastor'::app_role));

CREATE POLICY "Users can view their own attendance" ON public.attendance_records
  FOR SELECT USING (auth.uid() = user_id);

-- Fix payment_settings
DROP POLICY IF EXISTS "Treasurers can manage payment settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Staff can view payment settings" ON public.payment_settings;

CREATE POLICY "Treasurers can manage payment settings" ON public.payment_settings
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role));

CREATE POLICY "Staff can view payment settings" ON public.payment_settings
  FOR SELECT USING (is_staff(auth.uid()));

-- Fix departments
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
DROP POLICY IF EXISTS "Staff can view departments" ON public.departments;
DROP POLICY IF EXISTS "Members can view active departments" ON public.departments;

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Staff can view departments" ON public.departments
  FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Members can view active departments" ON public.departments
  FOR SELECT USING ((auth.uid() IS NOT NULL) AND (is_active = true));

-- Fix payment_categories
DROP POLICY IF EXISTS "Treasurers can manage payment categories" ON public.payment_categories;
DROP POLICY IF EXISTS "Staff can view payment categories" ON public.payment_categories;
DROP POLICY IF EXISTS "Members can view active payment categories" ON public.payment_categories;

CREATE POLICY "Treasurers can manage payment categories" ON public.payment_categories
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'treasurer'::app_role));

CREATE POLICY "Staff can view payment categories" ON public.payment_categories
  FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Members can view active payment categories" ON public.payment_categories
  FOR SELECT USING ((auth.uid() IS NOT NULL) AND (is_active = true));

-- Fix activity_logs
DROP POLICY IF EXISTS "Only super_admin can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;

CREATE POLICY "Only super_admin can view activity logs" ON public.activity_logs
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fix church_services
DROP POLICY IF EXISTS "Staff can manage services" ON public.church_services;
DROP POLICY IF EXISTS "Members can view services" ON public.church_services;

CREATE POLICY "Staff can manage services" ON public.church_services
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'secretary'::app_role) OR has_role(auth.uid(), 'pastor'::app_role));

CREATE POLICY "Members can view services" ON public.church_services
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix events
DROP POLICY IF EXISTS "Staff can create events" ON public.events;
DROP POLICY IF EXISTS "Staff can update events" ON public.events;
DROP POLICY IF EXISTS "Staff can delete events" ON public.events;
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON public.events;

CREATE POLICY "Staff can create events" ON public.events
  FOR INSERT WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update events" ON public.events
  FOR UPDATE USING (is_staff(auth.uid()));

CREATE POLICY "Staff can delete events" ON public.events
  FOR DELETE USING (is_staff(auth.uid()));

CREATE POLICY "Events are viewable by authenticated users" ON public.events
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix approved_role_emails
DROP POLICY IF EXISTS "Only super_admin can manage approved emails" ON public.approved_role_emails;

CREATE POLICY "Only super_admin can manage approved emails" ON public.approved_role_emails
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Fix member_departments
DROP POLICY IF EXISTS "Users can view their own department memberships" ON public.member_departments;
DROP POLICY IF EXISTS "Staff can view all department memberships" ON public.member_departments;
DROP POLICY IF EXISTS "Admins can manage department memberships" ON public.member_departments;

CREATE POLICY "Users can view their own department memberships" ON public.member_departments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all department memberships" ON public.member_departments
  FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Admins can manage department memberships" ON public.member_departments
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
