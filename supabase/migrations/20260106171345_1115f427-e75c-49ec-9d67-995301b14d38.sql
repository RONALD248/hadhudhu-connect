
-- Create enum for service types
CREATE TYPE public.service_type AS ENUM ('sabbath_school', 'divine_service', 'prayer_meeting', 'youth_program', 'midweek_service', 'special_event', 'other');

-- Create table for church services/events
CREATE TABLE public.church_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    service_type service_type NOT NULL DEFAULT 'divine_service',
    service_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    description TEXT,
    location TEXT DEFAULT 'Main Sanctuary',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create attendance records table
CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.church_services(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    checked_in_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add unique constraint to prevent duplicate attendance
ALTER TABLE public.attendance_records ADD CONSTRAINT unique_attendance UNIQUE (service_id, user_id);

-- Enable RLS
ALTER TABLE public.church_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for church_services
CREATE POLICY "Staff can manage services" ON public.church_services
FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'secretary'::app_role) OR
    has_role(auth.uid(), 'pastor'::app_role)
);

CREATE POLICY "Members can view services" ON public.church_services
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "deny_anonymous_services" ON public.church_services
FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS policies for attendance_records
CREATE POLICY "Staff can manage attendance" ON public.attendance_records
FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'secretary'::app_role) OR
    has_role(auth.uid(), 'pastor'::app_role)
);

CREATE POLICY "Users can view their own attendance" ON public.attendance_records
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "deny_anonymous_attendance" ON public.attendance_records
FOR ALL USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_church_services_updated_at
    BEFORE UPDATE ON public.church_services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_attendance_service_id ON public.attendance_records(service_id);
CREATE INDEX idx_attendance_user_id ON public.attendance_records(user_id);
CREATE INDEX idx_services_date ON public.church_services(service_date);
