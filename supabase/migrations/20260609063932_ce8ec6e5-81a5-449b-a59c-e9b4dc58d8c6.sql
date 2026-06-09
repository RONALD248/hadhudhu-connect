
CREATE OR REPLACE FUNCTION public.get_my_confirmed_receipts()
RETURNS TABLE (
  payment_id uuid,
  receipt_number text,
  amount numeric,
  payment_date date,
  payment_method text,
  reference_number text,
  description text,
  category_name text,
  category_code text,
  member_first_name text,
  member_last_name text,
  treasurer_first_name text,
  treasurer_last_name text,
  treasurer_confirmed_at timestamptz,
  secretary_first_name text,
  secretary_last_name text,
  secretary_confirmed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    pc.receipt_number,
    p.amount,
    p.payment_date,
    p.payment_method,
    p.reference_number,
    p.description,
    cat.name,
    cat.code,
    mp.first_name,
    mp.last_name,
    tp.first_name,
    tp.last_name,
    pc.treasurer_confirmed_at,
    sp.first_name,
    sp.last_name,
    pc.secretary_confirmed_at
  FROM public.payments p
  JOIN public.payment_confirmations pc ON pc.payment_id = p.id
  LEFT JOIN public.payment_categories cat ON cat.id = p.category_id
  LEFT JOIN public.profiles mp ON mp.user_id = p.user_id
  LEFT JOIN public.profiles tp ON tp.user_id = pc.treasurer_user_id
  LEFT JOIN public.profiles sp ON sp.user_id = pc.secretary_user_id
  WHERE p.user_id = auth.uid()
    AND pc.status = 'confirmed'
  ORDER BY p.payment_date DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_confirmed_receipts() TO authenticated;
