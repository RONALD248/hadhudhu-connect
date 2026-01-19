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

export interface PaymentSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
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

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['payment_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      return data as PaymentSetting[];
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

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...paymentData }: Partial<Payment> & { id: string }) => {
      const { data, error } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Success',
        description: 'Payment updated successfully.',
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

export function useUpdatePaymentSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ setting_key, setting_value, updated_by }: { setting_key: string; setting_value: string; updated_by?: string }) => {
      const { data, error } = await supabase
        .from('payment_settings')
        .update({ setting_value, updated_by })
        .eq('setting_key', setting_key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_settings'] });
      toast({
        title: 'Success',
        description: 'Payment setting updated successfully.',
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

export function useUpdatePaymentCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...categoryData }: Partial<PaymentCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('payment_categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_categories'] });
      toast({
        title: 'Success',
        description: 'Category updated successfully.',
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

// Pledges interfaces and hooks
export interface Pledge {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  fulfilled_amount: number;
  due_date: string | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PledgeWithDetails extends Pledge {
  payment_categories?: {
    name: string;
  };
}

export function usePledges() {
  return useQuery({
    queryKey: ['pledges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pledges')
        .select(`
          *,
          payment_categories:category_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as PledgeWithDetails[];
    },
  });
}

export function useCreatePledge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pledgeData: Omit<Pledge, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('pledges')
        .insert(pledgeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledges'] });
      toast({
        title: 'Success',
        description: 'Pledge recorded successfully.',
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

export function useUpdatePledge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...pledgeData }: Partial<Pledge> & { id: string }) => {
      const { data, error } = await supabase
        .from('pledges')
        .update(pledgeData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledges'] });
      toast({
        title: 'Success',
        description: 'Pledge updated successfully.',
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

// Record a payment against a pledge
export interface PledgePaymentData {
  pledge_id: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  description?: string;
}

export function useRecordPledgePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (paymentData: PledgePaymentData) => {
      // First, get the current pledge
      const { data: pledge, error: pledgeError } = await supabase
        .from('pledges')
        .select('*')
        .eq('id', paymentData.pledge_id)
        .single();

      if (pledgeError) throw pledgeError;
      if (!pledge) throw new Error('Pledge not found');

      // Calculate new fulfilled amount
      const newFulfilledAmount = Number(pledge.fulfilled_amount) + paymentData.amount;
      const pledgeAmount = Number(pledge.amount);
      
      // Determine new status
      let newStatus = pledge.status;
      if (newFulfilledAmount >= pledgeAmount) {
        newStatus = 'fulfilled';
      } else if (newFulfilledAmount > 0) {
        newStatus = 'pending'; // Keep as pending if partially fulfilled
      }

      // Record the payment in payments table
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: pledge.user_id,
          category_id: pledge.category_id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          reference_number: paymentData.reference_number || null,
          description: paymentData.description || `Pledge payment`,
          payment_date: new Date().toISOString().split('T')[0],
        });

      if (paymentError) throw paymentError;

      // Update the pledge with new fulfilled amount and status
      const { data: updatedPledge, error: updateError } = await supabase
        .from('pledges')
        .update({
          fulfilled_amount: newFulfilledAmount,
          status: newStatus,
        })
        .eq('id', paymentData.pledge_id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedPledge;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pledges'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      
      const isFulfilled = data.status === 'fulfilled';
      toast({
        title: isFulfilled ? 'Pledge Fulfilled!' : 'Payment Recorded',
        description: isFulfilled 
          ? 'This pledge has been fully fulfilled.' 
          : 'Payment recorded and pledge progress updated.',
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
