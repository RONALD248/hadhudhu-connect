
-- Drop the foreign key constraint on profiles.user_id that references auth.users
-- This allows secretaries to register members without requiring an auth account
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
