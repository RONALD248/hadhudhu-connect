import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Building2, Loader2 } from 'lucide-react';
import { usePaymentSettings } from '@/hooks/usePayments';

export function PaymentInstructions() {
  const { data: settings, isLoading } = usePaymentSettings();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const getSettingValue = (key: string) => 
    settings?.find(s => s.setting_key === key)?.setting_value || '';

  const mpesaPaybill = getSettingValue('mpesa_paybill');
  const mpesaAccount = getSettingValue('mpesa_account');
  const mpesaInstructions = getSettingValue('mpesa_instructions');
  const bankName = getSettingValue('bank_name');
  const bankAccount = getSettingValue('bank_account');
  const bankInstructions = getSettingValue('bank_instructions');

  const hasMpesaDetails = mpesaPaybill || mpesaAccount;
  const hasBankDetails = bankName || bankAccount;

  if (!hasMpesaDetails && !hasBankDetails) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {hasMpesaDetails && (
        <Card className="border-success/20 bg-success/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-5 w-5 text-success" />
              M-Pesa Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mpesaPaybill && (
              <div>
                <p className="text-sm text-muted-foreground">Paybill Number</p>
                <p className="font-bold text-lg">{mpesaPaybill}</p>
              </div>
            )}
            {mpesaAccount && (
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-bold text-lg">{mpesaAccount}</p>
              </div>
            )}
            {mpesaInstructions && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {mpesaInstructions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {hasBankDetails && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              Bank Transfer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bankName && (
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-bold text-lg">{bankName}</p>
              </div>
            )}
            {bankAccount && (
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-bold text-lg">{bankAccount}</p>
              </div>
            )}
            {bankInstructions && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {bankInstructions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}