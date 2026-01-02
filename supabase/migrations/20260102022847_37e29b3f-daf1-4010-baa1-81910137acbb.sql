-- Allow all authenticated users to view active departments
CREATE POLICY "Members can view active departments"
ON public.departments
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);