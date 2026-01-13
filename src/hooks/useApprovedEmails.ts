import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'super_admin' | 'treasurer' | 'secretary' | 'pastor' | 'elder' | 'member';

export interface ApprovedEmail {
  id: string;
  email_pattern: string;
  role: AppRole;
  description: string | null;
  created_at: string | null;
}

export function useApprovedEmails() {
  return useQuery({
    queryKey: ['approved-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approved_role_emails')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      return data as ApprovedEmail[];
    },
  });
}

export function useAddApprovedEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      emailPattern, 
      role, 
      description 
    }: { 
      emailPattern: string; 
      role: AppRole; 
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('approved_role_emails')
        .insert({
          email_pattern: emailPattern,
          role,
          description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-emails'] });
      toast({
        title: 'Email approved',
        description: 'The email pattern has been added to approved list.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteApprovedEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('approved_role_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-emails'] });
      toast({
        title: 'Email removed',
        description: 'The email pattern has been removed from approved list.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
