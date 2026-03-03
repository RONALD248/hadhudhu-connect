
-- Drop all triggers first to avoid conflicts, then recreate them

-- 2. Validate role assignments
DROP TRIGGER IF EXISTS on_role_assignment_validate ON public.user_roles;
CREATE TRIGGER on_role_assignment_validate
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_assignment();

-- 3. Log role changes
DROP TRIGGER IF EXISTS on_role_change_log ON public.user_roles;
CREATE TRIGGER on_role_change_log
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- 4. Log payment changes
DROP TRIGGER IF EXISTS on_payment_change_log ON public.payments;
CREATE TRIGGER on_payment_change_log
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_payment_change();

-- 5. Log profile changes
DROP TRIGGER IF EXISTS on_profile_change_log ON public.profiles;
CREATE TRIGGER on_profile_change_log
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_change();

-- 6-12. Auto-update updated_at timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_categories_updated_at ON public.payment_categories;
CREATE TRIGGER update_payment_categories_updated_at
  BEFORE UPDATE ON public.payment_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_settings_updated_at ON public.payment_settings;
CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pledges_updated_at ON public.pledges;
CREATE TRIGGER update_pledges_updated_at
  BEFORE UPDATE ON public.pledges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_church_services_updated_at ON public.church_services;
CREATE TRIGGER update_church_services_updated_at
  BEFORE UPDATE ON public.church_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Instant role activation on approved email insert
DROP TRIGGER IF EXISTS on_approved_email_inserted ON public.approved_role_emails;
CREATE TRIGGER on_approved_email_inserted
  AFTER INSERT ON public.approved_role_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_approved_email_inserted();

-- 14. Role reversion on approved email delete
DROP TRIGGER IF EXISTS on_approved_email_deleted ON public.approved_role_emails;
CREATE TRIGGER on_approved_email_deleted
  AFTER DELETE ON public.approved_role_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_approved_email_deleted();
