import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Filter, 
  Download,
  Wallet,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Contributions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const payments = [
    { id: 1, member: 'John Mwangi', category: 'Tithe', amount: 15000, method: 'mpesa', ref: 'TRX001234', date: '2024-01-15', status: 'completed' },
    { id: 2, member: 'Mary Wanjiku', category: 'Offering', amount: 2500, method: 'cash', ref: 'RCP00456', date: '2024-01-15', status: 'completed' },
    { id: 3, member: 'Peter Ochieng', category: 'Building Fund', amount: 50000, method: 'bank', ref: 'BNK00789', date: '2024-01-14', status: 'completed' },
    { id: 4, member: 'Grace Auma', category: 'Welfare', amount: 1000, method: 'mpesa', ref: 'TRX001235', date: '2024-01-14', status: 'completed' },
    { id: 5, member: 'Samuel Kiprop', category: 'Tithe', amount: 8000, method: 'cash', ref: 'RCP00457', date: '2024-01-13', status: 'completed' },
    { id: 6, member: 'Ruth Nyambura', category: 'Youth Fund', amount: 500, method: 'mpesa', ref: 'TRX001236', date: '2024-01-13', status: 'completed' },
    { id: 7, member: 'David Kamau', category: 'Camp Meeting', amount: 5000, method: 'cheque', ref: 'CHQ00123', date: '2024-01-12', status: 'pending' },
  ];

  const categories = ['Tithe', 'Offering', 'Building Fund', 'Welfare', 'Youth Fund', 'Camp Meeting', 'Sabbath School'];

  const filteredPayments = payments.filter(payment =>
    payment.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="h-4 w-4 text-success" />;
      case 'cash': return <Banknote className="h-4 w-4 text-warning" />;
      case 'bank': return <CreditCard className="h-4 w-4 text-primary" />;
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

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Payment recorded',
      description: 'The contribution has been successfully recorded.',
    });
    setIsAddDialogOpen(false);
  };

  const canRecordPayments = user?.role === 'super_admin' || user?.role === 'treasurer';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Contributions</h1>
          <p className="page-subtitle">Track and manage member contributions</p>
        </div>

        {canRecordPayments && (
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
                  <Label htmlFor="member">Member</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">John Mwangi</SelectItem>
                      <SelectItem value="2">Mary Wanjiku</SelectItem>
                      <SelectItem value="3">Peter Ochieng</SelectItem>
                      <SelectItem value="4">Grace Auma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase().replace(' ', '_')}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (KES)</Label>
                    <Input id="amount" type="number" placeholder="0.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input id="reference" placeholder="Transaction or receipt number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input id="notes" placeholder="Additional notes..." />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Record Payment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Today\'s Collections', value: 'KES 78,500', icon: Wallet, color: 'text-success' },
          { label: 'This Week', value: 'KES 245,000', icon: Calendar, color: 'text-primary' },
          { label: 'This Month', value: 'KES 485,200', icon: CreditCard, color: 'text-secondary' },
          { label: 'Pending Cheques', value: 'KES 25,000', icon: FileText, color: 'text-warning' },
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

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by member, category, or reference..."
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
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase().replace(' ', '_')}>
                      {cat}
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

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead className="hidden lg:table-cell">Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.member}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.category}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{formatAmount(payment.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(payment.method)}
                      <span className="capitalize">{payment.method}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-sm text-muted-foreground">
                    {payment.ref}
                  </TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={payment.status === 'completed' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
