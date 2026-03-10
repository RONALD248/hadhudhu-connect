import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, ShieldCheck, Download, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  PaymentConfirmation,
  useTreasurerConfirm,
  useSecretaryReview,
} from '@/hooks/usePaymentConfirmations';
import { usePayments, usePaymentCategories } from '@/hooks/usePayments';
import { useProfiles } from '@/hooks/useProfiles';
import { downloadReceiptPDF } from '@/lib/receiptPdf';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  paymentId: string;
  confirmation?: PaymentConfirmation | null;
}

export function PaymentConfirmationActions({ paymentId, confirmation }: Props) {
  const { user } = useAuth();
  const treasurerConfirm = useTreasurerConfirm();
  const secretaryReview = useSecretaryReview();
  const { data: payments } = usePayments();
  const { data: profiles } = useProfiles();
  const { data: categories } = usePaymentCategories();

  const isTreasurer = user?.role === 'super_admin' || user?.role === 'treasurer';
  const isSecretary = user?.role === 'secretary' || user?.role === 'super_admin';

  const getProfileName = (userId: string | null) => {
    if (!userId) return 'Unknown';
    const profile = profiles?.find(p => p.user_id === userId);
    return profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown';
  };

  const handleDownloadReceipt = () => {
    if (!confirmation) return;
    const payment = payments?.find(p => p.id === paymentId);
    if (!payment) return;

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

  // No confirmation record yet
  if (!confirmation) {
    if (isTreasurer) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => treasurerConfirm.mutate({ paymentId, userId: user!.id })}
                disabled={treasurerConfirm.isPending}
              >
                {treasurerConfirm.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                Confirm
              </Button>
            </TooltipTrigger>
            <TooltipContent>Confirm this payment as Treasurer</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return (
      <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  }

  // Treasurer confirmed, awaiting secretary
  if (confirmation.status === 'treasurer_confirmed') {
    if (isSecretary) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-secondary/50 text-secondary hover:bg-secondary/10"
                onClick={() => secretaryReview.mutate({ paymentId, userId: user!.id })}
                disabled={secretaryReview.isPending}
              >
                {secretaryReview.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ShieldCheck className="h-3 w-3" />
                )}
                Review & Approve
              </Button>
            </TooltipTrigger>
            <TooltipContent>Verify and generate receipt as Secretary</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return (
      <Badge variant="outline" className="text-xs gap-1 text-secondary">
        <CheckCircle2 className="h-3 w-3" />
        Treasurer OK
      </Badge>
    );
  }

  // Fully confirmed - show download button for staff
  if (confirmation.status === 'confirmed') {
    return (
      <div className="flex items-center gap-1.5">
        <Badge className="text-xs gap-1 bg-success/10 text-success border-success/20 hover:bg-success/20">
          <ShieldCheck className="h-3 w-3" />
          Verified
        </Badge>
        {(isTreasurer || isSecretary) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={handleDownloadReceipt}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download receipt PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      {confirmation.status}
    </Badge>
  );
}
