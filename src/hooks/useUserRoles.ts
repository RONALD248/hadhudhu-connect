import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'super_admin' | 'treasurer' | 'secretary' | 'pastor' | 'member';

export interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  profile: {
    first_name: string;
    last_name: string;
    phone: string | null;
  } | null;
  email?: string;
}

export function useUsersWithRoles() {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role')
        .order('role');

      if (rolesError) throw rolesError;

      // Fetch profiles separately
      const userIds = roles?.map(r => r.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, phone')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Merge data
      const usersWithRoles = roles?.map(r => {
        const profile = profiles?.find(p => p.user_id === r.user_id);
        return {
          id: r.id,
          user_id: r.user_id,
          role: r.role as AppRole,
          profile: profile ? {
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
          } : null,
        };
      }) || [];

      return usersWithRoles;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: 'Role updated',
        description: 'User role has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
