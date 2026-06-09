import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Loader2, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMyReceipts, type MyReceipt } from '@/hooks/useMyReceipts';
import { downloadReceiptPDF, downloadAllReceiptsPDF } from '@/lib/receiptPdf';

const fullName = (first: string | null, last: string | null, fallback = 'Pending') =>
  [first, last].filter(Boolean).join(' ').trim() || fallback;

const toReceiptData = (r: MyReceipt) => ({
  receiptNumber: r.receipt_number || `RCT-${r.payment_id.slice(0, 8).toUpperCase()}`,
  memberName: fullName(r.member_first_name, r.member_last_name, 'Member'),
  amount: Number(r.amount),
  paymentDate: r.payment_date,
  paymentMethod: r.payment_method,
  referenceNumber: r.reference_number,
  categoryName: r.category_name || 'General',
  categoryCode: r.category_code || '',
  description: r.description,
  treasurerName: fullName(r.treasurer_first_name, r.treasurer_last_name, 'Church Treasurer'),
  secretaryName: fullName(r.secretary_first_name, r.secretary_last_name, 'Church Secretary'),
  treasurerConfirmedAt: r.treasurer_confirmed_at,
  secretaryConfirmedAt: r.secretary_confirmed_at,
});

export function MemberReceipts() {
  const { data: receipts, isLoading, error } = useMyReceipts();
  const { toast } = useToast();

  const handleDownload = (receipt: MyReceipt) => {
    try {
      downloadReceiptPDF(toReceiptData(receipt));
      toast({ title: 'Receipt downloaded', description: `Receipt ${receipt.receipt_number} saved to your device.` });
    } catch (e) {
      toast({ title: 'Download failed', description: e instanceof Error ? e.message : 'Could not generate PDF', variant: 'destructive' });
    }
  };

  const handleDownloadAll = () => {
    if (!receipts || receipts.length === 0) return;
    try {
      const mapped = receipts.map(toReceiptData);
      downloadAllReceiptsPDF({ memberName: mapped[0].memberName, receipts: mapped });
      toast({ title: 'Combined report downloaded', description: `${mapped.length} receipts saved as a single PDF.` });
    } catch (e) {
      toast({ title: 'Download failed', description: e instanceof Error ? e.message : 'Could not generate PDF', variant: 'destructive' });
    }
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

  const list = receipts ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          My Payment Receipts
        </CardTitle>
        {list.length > 0 && (
          <Button size="sm" onClick={handleDownloadAll} className="gap-1.5">
            <FileDown className="h-4 w-4" />
            Download All ({list.length})
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-center text-destructive py-6 text-sm">
            Could not load your receipts. Please refresh and try again.
          </p>
        ) : list.length === 0 ? (
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
              {list.map((r) => (
                <TableRow key={r.payment_id}>
                  <TableCell>{r.payment_date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.category_name || 'Unknown'}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{formatAmount(Number(r.amount))}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {r.receipt_number || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => handleDownload(r)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
