import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useUpdatePayment, PaymentWithDetails, usePaymentCategories } from '@/hooks/usePayments';

interface EditPaymentDialogProps {
  payment: PaymentWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPaymentDialog({ payment, open, onOpenChange }: EditPaymentDialogProps) {
  const { data: categories } = usePaymentCategories();
  const updatePayment = useUpdatePayment();

  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount.toString());
      setPaymentDate(payment.payment_date);
      setPaymentMethod(payment.payment_method);
      setReferenceNumber(payment.reference_number || '');
      setDescription(payment.description || '');
      setCategoryId(payment.category_id);
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payment) return;

    await updatePayment.mutateAsync({
      id: payment.id,
      amount: parseFloat(amount),
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: referenceNumber || null,
      description: description || null,
      category_id: categoryId,
    });

    onOpenChange(false);
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Update payment details for {payment.payment_categories?.name || 'Unknown Category'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount (KES)</Label>
              <Input
                id="edit-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-reference">Reference Number</Label>
            <Input
              id="edit-reference"
              placeholder="Transaction or receipt number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Notes</Label>
            <Input
              id="edit-description"
              placeholder="Additional notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePayment.isPending}>
              {updatePayment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Payment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}