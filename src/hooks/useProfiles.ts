import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  gender: string | null;
  marital_status: string | null;
  date_of_birth: string | null;
  baptism_date: string | null;
  membership_number: string | null;
  occupation: string | null;
  employer: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Limited profile for secretaries (excludes sensitive fields)
export interface LimitedProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  membership_number: string | null;
  is_active: boolean;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfiles() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin';
  const isSecretary = user?.role === 'secretary';
  const isPastor = user?.role === 'pastor';
  const isElder = user?.role === 'elder';
  const isTreasurer = user?.role === 'treasurer';

  return useQuery({
    queryKey: ['profiles', user?.role],
    queryFn: async () => {
      // Super admin gets full access via direct table query
      if (isAdmin) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Profile[];
      }
      
      // Secretaries, pastors, elders, and treasurers get limited fields via RPC function
      if (isSecretary || isPastor || isElder || isTreasurer) {
        const { data, error } = await supabase
          .rpc('get_profiles_for_secretary');

        if (error) throw error;
        
        // Map limited profiles to full Profile type with null sensitive fields
        return (data as LimitedProfile[]).map(p => ({
          ...p,
          address: null,
          gender: null,
          marital_status: null,
          date_of_birth: null,
          baptism_date: null,
          occupation: null,
          employer: null,
          emergency_contact_name: null,
          emergency_contact_phone: null,
        })) as Profile[];
      }

      // Regular members can only see their own profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!user,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profileData: {
      user_id?: string;
      first_name: string;
      last_name: string;
      phone?: string | null;
      gender?: string | null;
      address?: string | null;
      marital_status?: string | null;
      occupation?: string | null;
      baptism_date?: string | null;
      membership_number?: string | null;
      is_active?: boolean;
    }) => {
      // Generate a placeholder user_id if not provided (for secretary-registered members)
      const dataToInsert = {
        ...profileData,
        user_id: profileData.user_id || crypto.randomUUID(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: 'Member registered',
        description: 'New member has been added successfully.',
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

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...profileData }: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
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
