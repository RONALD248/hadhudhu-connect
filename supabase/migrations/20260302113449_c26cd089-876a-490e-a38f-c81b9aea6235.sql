
-- When an approved email is ADDED, immediately update matching existing users' roles
CREATE OR REPLACE FUNCTION public.handle_approved_email_inserted()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  affected_user RECORD;
BEGIN
  -- Find existing users whose email matches the new pattern
  FOR affected_user IN
    SELECT au.id as user_id, au.email
    FROM auth.users au
    WHERE (
      au.email = NEW.email_pattern
      OR au.email LIKE NEW.email_pattern
      OR au.email ~* NEW.email_pattern
    )
  LOOP
    -- Recalculate the best role for this user from all approved entries
    UPDATE public.user_roles
    SET role = (
      SELECT are.role
      FROM public.approved_role_emails are
      WHERE (
        affected_user.email = are.email_pattern
        OR affected_user.email LIKE are.email_pattern
        OR affected_user.email ~* are.email_pattern
      )
      ORDER BY 
        CASE are.role
          WHEN 'super_admin' THEN 1
          WHEN 'treasurer' THEN 2
          WHEN 'secretary' THEN 3
          WHEN 'pastor' THEN 4
          WHEN 'elder' THEN 5
          ELSE 6
        END
      LIMIT 1
    )
    WHERE user_id = affected_user.user_id;
  END LOOP;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_approved_email_inserted
  AFTER INSERT ON public.approved_role_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_approved_email_inserted();
