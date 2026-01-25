-- Create events table for church events management
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT, -- 'weekly', 'monthly', 'yearly'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Everyone can view events
CREATE POLICY "Events are viewable by authenticated users"
ON public.events
FOR SELECT
TO authenticated
USING (true);

-- Only staff can create events
CREATE POLICY "Staff can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_staff(auth.uid())
);

-- Only staff can update events
CREATE POLICY "Staff can update events"
ON public.events
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()));

-- Only staff can delete events
CREATE POLICY "Staff can delete events"
ON public.events
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();