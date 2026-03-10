import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePayments, usePaymentCategories } from '@/hooks/usePayments';
import { usePaymentConfirmations } from '@/hooks/usePaymentConfirmations';
import { useProfiles } from '@/hooks/useProfiles';
import { downloadReceiptPDF } from '@/lib/receiptPdf';

export function MemberReceipts() {
  const { user } = useAuth();
  const { data: payments, isLoading } = usePayments();
  const { data: confirmations } = usePaymentConfirmations();
  const { data: profiles } = useProfiles();
  const { data: categories } = usePaymentCategories();

  // Filter payments for current member that are fully confirmed
  const confirmedPayments = payments?.filter(p => {
    if (p.user_id !== user?.id) return false;
    const conf = confirmations?.find(c => c.payment_id === p.id);
    return conf?.status === 'confirmed';
  }) || [];

  const getConfirmation = (paymentId: string) =>
    confirmations?.find(c => c.payment_id === paymentId) || null;

  const getProfileName = (userId: string | null) => {
    if (!userId) return 'Unknown';
    const profile = profiles?.find(p => p.user_id === userId);
    return profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown';
  };

  const handleDownload = (paymentId: string) => {
    const payment = payments?.find(p => p.id === paymentId);
    const confirmation = getConfirmation(paymentId);
    if (!payment || !confirmation) return;

    const memberName = payment.profiles
      ? `${payment.profiles.first_name} ${payment.profiles.last_name}`
      : 'Member';

    const category = categories?.find(c => c.id === payment.category_id);

    downloadReceiptPDF({
      receiptNumber: confirmation.receipt_number || `RCT-${Date.now()}`,
      memberName,
      amount: Number(payment.amount),
      paymentDate: payment.payment_date,
      paymentMethod: payment.payment_method,
      referenceNumber: payment.reference_number,
      categoryName: payment.payment_categories?.name || 'General',
      categoryCode: category?.code || '',
      description: payment.description,
      treasurerName: getProfileName(confirmation.treasurer_user_id),
      secretaryName: getProfileName(confirmation.secretary_user_id),
      treasurerConfirmedAt: confirmation.treasurer_confirmed_at,
      secretaryConfirmedAt: confirmation.secretary_confirmed_at,
    });
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          My Payment Receipts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {confirmedPayments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No confirmed receipts yet. Receipts appear here after the Treasurer and Secretary verify your payments.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Receipt No.</TableHead>
                <TableHead className="w-[80px]">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {confirmedPayments.map((payment) => {
                const conf = getConfirmation(payment.id);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.payment_date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.payment_categories?.name || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{formatAmount(Number(payment.amount))}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {conf?.receipt_number || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => handleDownload(payment.id)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
