CREATE POLICY "require_auth_member_departments"
ON public.member_departments
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);