import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Payment {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number: string | null;
  description: string | null;
  receipt_url: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  target_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentWithDetails extends Payment {
  profiles?: {
    first_name: string;
    last_name: string;
  };
  payment_categories?: {
    name: string;
  };
}

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          payment_categories:category_id (name)
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as unknown as PaymentWithDetails[];
    },
  });
}

export function usePaymentCategories() {
  return useQuery({
    queryKey: ['payment_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as PaymentCategory[];
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Success',
        description: 'Payment recorded successfully.',
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

export function useCreatePaymentCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoryData: Omit<PaymentCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payment_categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_categories'] });
      toast({
        title: 'Success',
        description: 'Category created successfully.',
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
