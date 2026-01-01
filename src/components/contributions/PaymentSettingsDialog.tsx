import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Settings } from 'lucide-react';
import { usePaymentSettings, useUpdatePaymentSetting, PaymentSetting } from '@/hooks/usePayments';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentSettingsDialog({ open, onOpenChange }: PaymentSettingsDialogProps) {
  const { user } = useAuth();
  const { data: settings, isLoading } = usePaymentSettings();
  const updateSetting = useUpdatePaymentSetting();

  const [mpesaPaybill, setMpesaPaybill] = useState('');
  const [mpesaAccount, setMpesaAccount] = useState('');
  const [mpesaInstructions, setMpesaInstructions] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankInstructions, setBankInstructions] = useState('');

  useEffect(() => {
    if (settings) {
      const getSettingValue = (key: string) => 
        settings.find(s => s.setting_key === key)?.setting_value || '';
      
      setMpesaPaybill(getSettingValue('mpesa_paybill'));
      setMpesaAccount(getSettingValue('mpesa_account'));
      setMpesaInstructions(getSettingValue('mpesa_instructions'));
      setBankName(getSettingValue('bank_name'));
      setBankAccount(getSettingValue('bank_account'));
      setBankInstructions(getSettingValue('bank_instructions'));
    }
  }, [settings]);

  const handleSave = async () => {
    const updates = [
      { key: 'mpesa_paybill', value: mpesaPaybill },
      { key: 'mpesa_account', value: mpesaAccount },
      { key: 'mpesa_instructions', value: mpesaInstructions },
      { key: 'bank_name', value: bankName },
      { key: 'bank_account', value: bankAccount },
      { key: 'bank_instructions', value: bankInstructions },
    ];

    for (const update of updates) {
      await updateSetting.mutateAsync({
        setting_key: update.key,
        setting_value: update.value,
        updated_by: user?.id,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Settings
          </DialogTitle>
          <DialogDescription>
            Configure M-Pesa and bank payment details for members
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* M-Pesa Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">M-Pesa Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paybill">Paybill Number</Label>
                  <Input
                    id="paybill"
                    placeholder="e.g., 123456"
                    value={mpesaPaybill}
                    onChange={(e) => setMpesaPaybill(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account Number</Label>
                  <Input
                    id="account"
                    placeholder="e.g., Member ID"
                    value={mpesaAccount}
                    onChange={(e) => setMpesaAccount(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesa-instructions">Payment Instructions</Label>
                <Textarea
                  id="mpesa-instructions"
                  placeholder="Instructions for members on how to pay via M-Pesa..."
                  value={mpesaInstructions}
                  onChange={(e) => setMpesaInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Bank Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Bank Transfer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    placeholder="e.g., KCB Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-account">Account Number</Label>
                  <Input
                    id="bank-account"
                    placeholder="e.g., 1234567890"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-instructions">Bank Instructions</Label>
                <Textarea
                  id="bank-instructions"
                  placeholder="Instructions for bank transfers..."
                  value={bankInstructions}
                  onChange={(e) => setBankInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateSetting.isPending}>
                {updateSetting.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}