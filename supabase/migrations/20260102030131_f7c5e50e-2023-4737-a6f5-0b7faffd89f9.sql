-- Create trigger function for logging role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'role_assigned', 'user_role', NEW.id, 
      jsonb_build_object('target_user_id', NEW.user_id, 'role', NEW.role));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'role_changed', 'user_role', NEW.id,
      jsonb_build_object('target_user_id', NEW.user_id, 'old_role', OLD.role, 'new_role', NEW.role));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'role_removed', 'user_role', OLD.id,
      jsonb_build_object('target_user_id', OLD.user_id, 'role', OLD.role));
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger function for logging payment changes
CREATE OR REPLACE FUNCTION public.log_payment_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'payment_created', 'payment', NEW.id,
      jsonb_build_object('member_id', NEW.user_id, 'amount', NEW.amount, 'category_id', NEW.category_id, 'payment_method', NEW.payment_method));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'payment_modified', 'payment', NEW.id,
      jsonb_build_object('member_id', NEW.user_id, 'old_amount', OLD.amount, 'new_amount', NEW.amount, 'category_id', NEW.category_id));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'payment_deleted', 'payment', OLD.id,
      jsonb_build_object('member_id', OLD.user_id, 'amount', OLD.amount, 'category_id', OLD.category_id));
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger function for logging profile changes
CREATE OR REPLACE FUNCTION public.log_profile_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_fields jsonb := '{}';
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Track which fields changed (only sensitive ones)
    IF OLD.first_name IS DISTINCT FROM NEW.first_name THEN
      changed_fields := changed_fields || jsonb_build_object('first_name', jsonb_build_object('old', OLD.first_name, 'new', NEW.first_name));
    END IF;
    IF OLD.last_name IS DISTINCT FROM NEW.last_name THEN
      changed_fields := changed_fields || jsonb_build_object('last_name', jsonb_build_object('old', OLD.last_name, 'new', NEW.last_name));
    END IF;
    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
      changed_fields := changed_fields || jsonb_build_object('phone', 'changed');
    END IF;
    IF OLD.address IS DISTINCT FROM NEW.address THEN
      changed_fields := changed_fields || jsonb_build_object('address', 'changed');
    END IF;
    IF OLD.emergency_contact_phone IS DISTINCT FROM NEW.emergency_contact_phone THEN
      changed_fields := changed_fields || jsonb_build_object('emergency_contact', 'changed');
    END IF;
    IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
      changed_fields := changed_fields || jsonb_build_object('is_active', jsonb_build_object('old', OLD.is_active, 'new', NEW.is_active));
    END IF;
    
    -- Only log if there were changes
    IF changed_fields != '{}' THEN
      INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
      VALUES (auth.uid(), 'profile_updated', 'profile', NEW.id,
        jsonb_build_object('target_user_id', NEW.user_id, 'changes', changed_fields));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER audit_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

CREATE TRIGGER audit_payment_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.log_payment_change();

CREATE TRIGGER audit_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_change();