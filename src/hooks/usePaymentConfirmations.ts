import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentConfirmation {
  id: string;
  payment_id: string;
  treasurer_user_id: string | null;
  treasurer_confirmed_at: string | null;
  secretary_user_id: string | null;
  secretary_confirmed_at: string | null;
  receipt_sent: boolean;
  receipt_sent_at: string | null;
  receipt_number: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function usePaymentConfirmations() {
  return useQuery({
    queryKey: ['payment_confirmations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_confirmations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PaymentConfirmation[];
    },
  });
}

export function useTreasurerConfirm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ paymentId, userId }: { paymentId: string; userId: string }) => {
      // Check if confirmation record exists
      const { data: existing } = await supabase
        .from('payment_confirmations')
        .select('id')
        .eq('payment_id', paymentId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('payment_confirmations')
          .update({
            treasurer_user_id: userId,
            treasurer_confirmed_at: new Date().toISOString(),
            status: 'treasurer_confirmed',
          })
          .eq('payment_id', paymentId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('payment_confirmations')
          .insert({
            payment_id: paymentId,
            treasurer_user_id: userId,
            treasurer_confirmed_at: new Date().toISOString(),
            status: 'treasurer_confirmed',
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_confirmations'] });
      toast({
        title: 'Payment Confirmed',
        description: 'Awaiting secretary review to complete verification.',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useSecretaryReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ paymentId, userId }: { paymentId: string; userId: string }) => {
      const receiptNumber = `RCT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const { data, error } = await supabase
        .from('payment_confirmations')
        .update({
          secretary_user_id: userId,
          secretary_confirmed_at: new Date().toISOString(),
          status: 'confirmed',
          receipt_number: receiptNumber,
          receipt_sent: true,
          receipt_sent_at: new Date().toISOString(),
        })
        .eq('payment_id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Verified ✅',
        description: 'Receipt is now available for the member to download.',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
