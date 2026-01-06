import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChurchService {
  id: string;
  title: string;
  service_type: 'sabbath_school' | 'divine_service' | 'prayer_meeting' | 'youth_program' | 'midweek_service' | 'special_event' | 'other';
  service_date: string;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  location: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  service_id: string;
  user_id: string;
  checked_in_at: string;
  checked_in_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface AttendanceWithProfile extends AttendanceRecord {
  profile?: {
    first_name: string;
    last_name: string;
    membership_number: string | null;
    photo_url: string | null;
  };
}

export const useChurchServices = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['church-services', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('church_services')
        .select('*')
        .order('service_date', { ascending: false });

      if (startDate) {
        query = query.gte('service_date', startDate);
      }
      if (endDate) {
        query = query.lte('service_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ChurchService[];
    },
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (service: Omit<ChurchService, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('church_services')
        .insert(service)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['church-services'] });
      toast({ title: 'Service created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating service', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('church_services')
        .delete()
        .eq('id', serviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['church-services'] });
      toast({ title: 'Service deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting service', description: error.message, variant: 'destructive' });
    },
  });
};

export const useAttendanceRecords = (serviceId: string) => {
  return useQuery({
    queryKey: ['attendance-records', serviceId],
    queryFn: async () => {
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('service_id', serviceId)
        .order('checked_in_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for each user
      const userIds = records.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, membership_number, photo_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return records.map(record => ({
        ...record,
        profile: profileMap.get(record.user_id),
      })) as AttendanceWithProfile[];
    },
    enabled: !!serviceId,
  });
};

export const useRecordAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ serviceId, userIds, checkedInBy }: { serviceId: string; userIds: string[]; checkedInBy: string }) => {
      const records = userIds.map(userId => ({
        service_id: serviceId,
        user_id: userId,
        checked_in_by: checkedInBy,
      }));

      const { error } = await supabase
        .from('attendance_records')
        .upsert(records, { onConflict: 'service_id,user_id' });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
      toast({ title: 'Attendance recorded successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error recording attendance', description: error.message, variant: 'destructive' });
    },
  });
};

export const useRemoveAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ serviceId, userId }: { serviceId: string; userId: string }) => {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('service_id', serviceId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
      toast({ title: 'Attendance removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error removing attendance', description: error.message, variant: 'destructive' });
    },
  });
};

export const useAttendanceStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['attendance-stats', startDate, endDate],
    queryFn: async () => {
      let servicesQuery = supabase.from('church_services').select('id, service_date, service_type');
      
      if (startDate) servicesQuery = servicesQuery.gte('service_date', startDate);
      if (endDate) servicesQuery = servicesQuery.lte('service_date', endDate);

      const { data: services, error: servicesError } = await servicesQuery;
      if (servicesError) throw servicesError;

      const serviceIds = services?.map(s => s.id) || [];
      
      if (serviceIds.length === 0) {
        return { totalServices: 0, totalAttendance: 0, averageAttendance: 0, byServiceType: {} };
      }

      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('service_id')
        .in('service_id', serviceIds);

      if (attendanceError) throw attendanceError;

      const attendanceByService = attendance?.reduce((acc, record) => {
        acc[record.service_id] = (acc[record.service_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const byServiceType = services?.reduce((acc, service) => {
        if (!acc[service.service_type]) {
          acc[service.service_type] = { count: 0, totalAttendance: 0 };
        }
        acc[service.service_type].count++;
        acc[service.service_type].totalAttendance += attendanceByService[service.id] || 0;
        return acc;
      }, {} as Record<string, { count: number; totalAttendance: number }>) || {};

      const totalAttendance = attendance?.length || 0;
      const totalServices = services?.length || 0;

      return {
        totalServices,
        totalAttendance,
        averageAttendance: totalServices > 0 ? Math.round(totalAttendance / totalServices) : 0,
        byServiceType,
      };
    },
  });
};
