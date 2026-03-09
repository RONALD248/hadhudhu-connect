import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, ShieldCheck, Mail, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  PaymentConfirmation,
  useTreasurerConfirm,
  useSecretaryReview,
} from '@/hooks/usePaymentConfirmations';
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

  const isTreasurer = user?.role === 'super_admin' || user?.role === 'treasurer';
  const isSecretary = user?.role === 'secretary' || user?.role === 'super_admin';

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
                Review & Send Receipt
              </Button>
            </TooltipTrigger>
            <TooltipContent>Verify and send receipt as Secretary</TooltipContent>
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

  // Fully confirmed
  if (confirmation.status === 'confirmed') {
    return (
      <Badge className="text-xs gap-1 bg-success/10 text-success border-success/20 hover:bg-success/20">
        {confirmation.receipt_sent ? (
          <>
            <Mail className="h-3 w-3" />
            Receipt Sent
          </>
        ) : (
          <>
            <ShieldCheck className="h-3 w-3" />
            Verified
          </>
        )}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      {confirmation.status}
    </Badge>
  );
}
