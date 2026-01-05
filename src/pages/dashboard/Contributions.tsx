import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Download,
  Wallet,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  Loader2,
  Settings,
  Pencil
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePayments, usePaymentCategories, useCreatePayment, PaymentWithDetails } from '@/hooks/usePayments';
import { useProfiles } from '@/hooks/useProfiles';
import { PaymentSettingsDialog } from '@/components/contributions/PaymentSettingsDialog';
import { EditPaymentDialog } from '@/components/contributions/EditPaymentDialog';
import { PaymentInstructions } from '@/components/contributions/PaymentInstructions';

export default function Contributions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentWithDetails | null>(null);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: categories } = usePaymentCategories();
  const { data: profiles } = useProfiles();
  const createPayment = useCreatePayment();

  const filteredPayments = payments?.filter(payment => {
    const categoryName = payment.payment_categories?.name || '';
    return categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="h-4 w-4 text-success" />;
      case 'cash': return <Banknote className="h-4 w-4 text-warning" />;
      case 'bank_transfer': return <CreditCard className="h-4 w-4 text-primary" />;
      case 'cheque': return <FileText className="h-4 w-4 text-muted-foreground" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMember || !selectedCategory || !amount || !paymentMethod) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createPayment.mutateAsync({
        user_id: selectedMember,
        category_id: selectedCategory,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        payment_date: paymentDate,
        reference_number: referenceNumber || null,
        description: notes || null,
        receipt_url: null,
        recorded_by: user?.id || null,
      });
      
      setIsAddDialogOpen(false);
      // Reset form
      setSelectedMember('');
      setSelectedCategory('');
      setAmount('');
      setPaymentMethod('');
      setReferenceNumber('');
      setNotes('');
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const canRecordPayments = user?.role === 'super_admin' || user?.role === 'treasurer';
  const canViewPayments = user?.role === 'super_admin' || user?.role === 'treasurer' || user?.role === 'secretary' || user?.role === 'pastor';

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayTotal = payments?.filter(p => p.payment_date === today).reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalAmount = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Contributions</h1>
          <p className="page-subtitle">Track and manage member contributions</p>
        </div>

        <div className="flex gap-2">
          {canRecordPayments && (
            <>
              <Button variant="outline" className="gap-2" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Payment Settings</span>
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Record New Payment</DialogTitle>
                    <DialogDescription>
                      Enter the contribution details below
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPayment} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="member">Member *</Label>
                      <Select value={selectedMember} onValueChange={setSelectedMember}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles?.map((profile) => (
                            <SelectItem key={profile.user_id} value={profile.user_id}>
                              {profile.first_name} {profile.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                        <Label htmlFor="amount">Amount (KES) *</Label>
                        <Input 
                          id="amount" 
                          type="number" 
                          placeholder="0.00" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input 
                          id="date" 
                          type="date" 
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="method">Payment Method *</Label>
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
                      <Label htmlFor="reference">Reference Number</Label>
                      <Input 
                        id="reference" 
                        placeholder="Transaction or receipt number" 
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input 
                        id="notes" 
                        placeholder="Additional notes..." 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPayment.isPending}>
                        {createPayment.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Recording...
                          </>
                        ) : (
                          'Record Payment'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Payment Instructions for Members */}
      <PaymentInstructions />

      {/* Stats Cards */}
      {canViewPayments && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Today's Collections", value: formatAmount(todayTotal), icon: Wallet, color: 'text-success' },
            { label: 'Total Payments', value: (payments?.length || 0).toString(), icon: Calendar, color: 'text-primary' },
            { label: 'Total Amount', value: formatAmount(totalAmount), icon: CreditCard, color: 'text-secondary' },
            { label: 'Categories', value: (categories?.length || 0).toString(), icon: FileText, color: 'text-warning' },
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Search */}
      {canViewPayments && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by category or reference..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      {canViewPayments && (
        <Card>
          <CardContent className="p-0">
            {paymentsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">No payments found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {canRecordPayments ? 'Click "Record Payment" to add the first contribution.' : 'No contributions have been recorded yet.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Method</TableHead>
                    <TableHead className="hidden lg:table-cell">Reference</TableHead>
                    <TableHead>Date</TableHead>
                    {canRecordPayments && <TableHead className="w-[80px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Badge variant="outline">{payment.payment_categories?.name || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatAmount(Number(payment.amount))}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.payment_method)}
                          <span className="capitalize">{payment.payment_method.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell font-mono text-sm text-muted-foreground">
                        {payment.reference_number || '-'}
                      </TableCell>
                      <TableCell>{payment.payment_date}</TableCell>
                      {canRecordPayments && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPayment(payment)}
                            title="Edit payment"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Non-staff member view */}
      {!canViewPayments && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Use the payment details above to make your contribution.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact the treasurer if you have questions about your payments.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <PaymentSettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <EditPaymentDialog 
        payment={editingPayment} 
        open={!!editingPayment} 
        onOpenChange={(open) => !open && setEditingPayment(null)} 
      />
    </div>
  );
}
