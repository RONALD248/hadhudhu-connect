import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MyReceipt {
  payment_id: string;
  receipt_number: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string | null;
  description: string | null;
  category_name: string | null;
  category_code: string | null;
  member_first_name: string | null;
  member_last_name: string | null;
  treasurer_first_name: string | null;
  treasurer_last_name: string | null;
  treasurer_confirmed_at: string | null;
  secretary_first_name: string | null;
  secretary_last_name: string | null;
  secretary_confirmed_at: string | null;
}

export function useMyReceipts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my_confirmed_receipts', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('get_my_confirmed_receipts');
      if (error) throw error;
      return (data ?? []) as MyReceipt[];
    },
  });
}
