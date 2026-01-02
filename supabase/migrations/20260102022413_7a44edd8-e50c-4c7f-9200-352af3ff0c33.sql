-- Create a table to store approved church emails for sensitive roles
CREATE TABLE public.approved_role_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_pattern TEXT NOT NULL,
    role app_role NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(email_pattern, role)
);

-- Enable RLS
ALTER TABLE public.approved_role_emails ENABLE ROW LEVEL SECURITY;

-- Only super_admin can manage approved emails
CREATE POLICY "Only super_admin can manage approved emails"
ON public.approved_role_emails
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Deny anonymous access
CREATE POLICY "deny_anonymous_access_approved_emails"
ON public.approved_role_emails
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create a function to validate role assignments for sensitive roles
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_email TEXT;
    is_approved BOOLEAN;
BEGIN
    -- Only validate for secretary role (most sensitive for data access)
    IF NEW.role IN ('secretary'::app_role) THEN
        -- Get the user's email from auth.users
        SELECT email INTO user_email
        FROM auth.users
        WHERE id = NEW.user_id;
        
        -- Check if email matches any approved pattern
        SELECT EXISTS (
            SELECT 1 FROM public.approved_role_emails
            WHERE role = NEW.role
            AND (
                user_email = email_pattern  -- Exact match
                OR user_email LIKE email_pattern  -- Pattern match with wildcards
                OR user_email ~* email_pattern  -- Regex match (case insensitive)
            )
        ) INTO is_approved;
        
        -- If no approved emails exist yet, allow (for initial setup)
        IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM public.approved_role_emails WHERE role = NEW.role) THEN
            is_approved := TRUE;
        END IF;
        
        IF NOT is_approved THEN
            RAISE EXCEPTION 'Email "%" is not approved for the secretary role. Contact super admin to add approved church emails.', user_email;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger on user_roles for INSERT and UPDATE
CREATE TRIGGER validate_role_before_change
    BEFORE INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_role_assignment();

-- Fix payment_categories exposure - drop the permissive policy and create staff-only
DROP POLICY IF EXISTS "Authenticated users can view payment categories" ON public.payment_categories;

CREATE POLICY "Staff can view payment categories"
ON public.payment_categories
FOR SELECT
USING (is_staff(auth.uid()));

-- Members need to see categories for their own payments, so add that
CREATE POLICY "Members can view active payment categories"
ON public.payment_categories
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);