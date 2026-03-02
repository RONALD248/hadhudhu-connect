
-- 1. Update handle_new_user to auto-assign role from approved_role_emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  matched_role app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'User'),
    NEW.raw_user_meta_data ->> 'phone'
  );

  -- Check if this email has a pre-approved role
  SELECT role INTO matched_role
  FROM public.approved_role_emails
  WHERE (
    NEW.email = email_pattern
    OR NEW.email LIKE email_pattern
    OR NEW.email ~* email_pattern
  )
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'treasurer' THEN 2
      WHEN 'secretary' THEN 3
      WHEN 'pastor' THEN 4
      WHEN 'elder' THEN 5
      ELSE 6
    END
  LIMIT 1;

  -- Assign matched role or default to member
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(matched_role, 'member'));

  RETURN NEW;
END;
$function$;

-- 2. Create function to handle approved email deletion - revert affected users to 'member'
CREATE OR REPLACE FUNCTION public.handle_approved_email_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected_user RECORD;
  new_matched_role app_role;
BEGIN
  -- Find users who currently have the deleted role and whose email matched the deleted pattern
  FOR affected_user IN
    SELECT ur.user_id, au.email
    FROM public.user_roles ur
    JOIN auth.users au ON au.id = ur.user_id
    WHERE ur.role = OLD.role
    AND (
      au.email = OLD.email_pattern
      OR au.email LIKE OLD.email_pattern
      OR au.email ~* OLD.email_pattern
    )
  LOOP
    -- Check if there's another approved email entry that still matches this user
    SELECT are.role INTO new_matched_role
    FROM public.approved_role_emails are
    WHERE are.id != OLD.id
    AND (
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
    LIMIT 1;

    -- Update to next matching role or revert to member
    UPDATE public.user_roles
    SET role = COALESCE(new_matched_role, 'member')
    WHERE user_id = affected_user.user_id;
  END LOOP;

  RETURN OLD;
END;
$function$;

-- 3. Create trigger on approved_role_emails for DELETE
CREATE TRIGGER on_approved_email_deleted
  BEFORE DELETE ON public.approved_role_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_approved_email_deleted();

-- 4. Update validate_role_assignment to work for all roles (not just secretary)
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_email TEXT;
    is_approved BOOLEAN;
BEGIN
    -- Only validate for sensitive roles
    IF NEW.role IN ('secretary'::app_role, 'treasurer'::app_role, 'pastor'::app_role, 'elder'::app_role, 'super_admin'::app_role) THEN
        -- Get the user's email from auth.users
        SELECT email INTO user_email
        FROM auth.users
        WHERE id = NEW.user_id;
        
        -- Check if email matches any approved pattern for this role
        SELECT EXISTS (
            SELECT 1 FROM public.approved_role_emails
            WHERE role = NEW.role
            AND (
                user_email = email_pattern
                OR user_email LIKE email_pattern
                OR user_email ~* email_pattern
            )
        ) INTO is_approved;
        
        -- If no approved emails exist for this role, allow (for initial setup)
        IF NOT EXISTS (SELECT 1 FROM public.approved_role_emails WHERE role = NEW.role) THEN
            is_approved := TRUE;
        END IF;
        
        IF NOT is_approved THEN
            RAISE EXCEPTION 'Email "%" is not approved for the % role. Contact super admin to add approved emails.', user_email, NEW.role;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;
