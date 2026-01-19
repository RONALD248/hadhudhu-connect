import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePledges, useCreatePledge, useUpdatePledge, usePaymentCategories, PledgeWithDetails } from '@/hooks/usePayments';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Target,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  HandCoins,
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';

export default function Pledges() {
  const { user } = useAuth();
  const { data: pledges = [], isLoading } = usePledges();
  const { data: categories = [] } = usePaymentCategories();
  const { data: profiles = [] } = useProfiles();
  const createPledge = useCreatePledge();
  const updatePledge = useUpdatePledge();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<PledgeWithDetails | null>(null);

  // Form state for new pledge
  const [newPledge, setNewPledge] = useState({
    user_id: '',
    category_id: '',
    amount: '',
    due_date: '',
    description: '',
  });

  // Form state for editing pledge
  const [editPledge, setEditPledge] = useState({
    amount: '',
    fulfilled_amount: '',
    due_date: '',
    status: '',
    description: '',
  });

  const canManagePledges = user?.role === 'super_admin' || user?.role === 'treasurer';

  // Get member name from user_id
  const getMemberName = (userId: string) => {
    const profile = profiles.find((p) => p.user_id === userId);
    return profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Member';
  };

  // Filter pledges
  const filteredPledges = pledges.filter((pledge) => {
    const memberName = getMemberName(pledge.user_id).toLowerCase();
    const categoryName = pledge.payment_categories?.name?.toLowerCase() || '';
    const matchesSearch =
      memberName.includes(searchQuery.toLowerCase()) ||
      categoryName.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pledge.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalPledged = pledges.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalFulfilled = pledges.reduce((sum, p) => sum + Number(p.fulfilled_amount), 0);
  const pendingPledges = pledges.filter((p) => p.status === 'pending').length;
  const overduePledges = pledges.filter(
    (p) => p.status === 'pending' && p.due_date && isBefore(parseISO(p.due_date), new Date())
  ).length;
  const completedPledges = pledges.filter((p) => p.status === 'fulfilled').length;
  const upcomingDue = pledges.filter(
    (p) =>
      p.status === 'pending' &&
      p.due_date &&
      isAfter(parseISO(p.due_date), new Date()) &&
      isBefore(parseISO(p.due_date), addDays(new Date(), 7))
  ).length;

  const overallProgress = totalPledged > 0 ? (totalFulfilled / totalPledged) * 100 : 0;

  const handleCreatePledge = () => {
    if (!newPledge.user_id || !newPledge.category_id || !newPledge.amount) return;

    createPledge.mutate(
      {
        user_id: newPledge.user_id,
        category_id: newPledge.category_id,
        amount: parseFloat(newPledge.amount),
        fulfilled_amount: 0,
        due_date: newPledge.due_date || null,
        status: 'pending',
        description: newPledge.description || null,
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewPledge({
            user_id: '',
            category_id: '',
            amount: '',
            due_date: '',
            description: '',
          });
        },
      }
    );
  };

  const handleEditPledge = () => {
    if (!selectedPledge) return;

    updatePledge.mutate(
      {
        id: selectedPledge.id,
        amount: parseFloat(editPledge.amount),
        fulfilled_amount: parseFloat(editPledge.fulfilled_amount),
        due_date: editPledge.due_date || null,
        status: editPledge.status,
        description: editPledge.description || null,
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedPledge(null);
        },
      }
    );
  };

  const openEditDialog = (pledge: PledgeWithDetails) => {
    setSelectedPledge(pledge);
    setEditPledge({
      amount: pledge.amount.toString(),
      fulfilled_amount: pledge.fulfilled_amount.toString(),
      due_date: pledge.due_date || '',
      status: pledge.status,
      description: pledge.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string, dueDate: string | null) => {
    if (status === 'fulfilled') {
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Fulfilled
        </Badge>
      );
    }
    if (status === 'cancelled') {
      return (
        <Badge variant="destructive">
          Cancelled
        </Badge>
      );
    }
    if (dueDate && isBefore(parseISO(dueDate), new Date())) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    return (
      <Badge className="bg-warning/10 text-warning border-warning/20">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pledges</h1>
          <p className="text-muted-foreground">Manage and track member pledges</p>
        </div>

        {canManagePledges && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Pledge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Pledge</DialogTitle>
                <DialogDescription>Record a new pledge from a member</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="member">Member</Label>
                  <Select
                    value={newPledge.user_id}
                    onValueChange={(value) => setNewPledge({ ...newPledge, user_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.first_name} {profile.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newPledge.category_id}
                    onValueChange={(value) => setNewPledge({ ...newPledge, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Pledged Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newPledge.amount}
                    onChange={(e) => setNewPledge({ ...newPledge, amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date (Optional)</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newPledge.due_date}
                    onChange={(e) => setNewPledge({ ...newPledge, due_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add notes about this pledge..."
                    value={newPledge.description}
                    onChange={(e) => setNewPledge({ ...newPledge, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePledge} disabled={createPledge.isPending}>
                  {createPledge.isPending ? 'Creating...' : 'Create Pledge'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pledged</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPledged)}</div>
            <Progress value={overallProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {overallProgress.toFixed(1)}% fulfilled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fulfilled</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalFulfilled)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedPledges} pledges completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingPledges}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingDue} due within 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overduePledges}</div>
            <p className="text-xs text-muted-foreground mt-1">Require follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pledges Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Pledges List
          </CardTitle>
          <CardDescription>
            {filteredPledges.length} pledge{filteredPledges.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPledges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HandCoins className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pledges found</p>
              {canManagePledges && (
                <p className="text-sm mt-2">Click "New Pledge" to create one</p>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Pledged</TableHead>
                    <TableHead className="text-right">Fulfilled</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    {canManagePledges && <TableHead className="w-[50px]" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPledges.map((pledge) => {
                    const progress =
                      Number(pledge.amount) > 0
                        ? (Number(pledge.fulfilled_amount) / Number(pledge.amount)) * 100
                        : 0;
                    return (
                      <TableRow key={pledge.id}>
                        <TableCell className="font-medium">
                          {getMemberName(pledge.user_id)}
                        </TableCell>
                        <TableCell>{pledge.payment_categories?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(pledge.amount))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(pledge.fulfilled_amount))}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-2 w-20" />
                            <span className="text-xs text-muted-foreground">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pledge.due_date ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(pledge.due_date), 'MMM d, yyyy')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No due date</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(pledge.status, pledge.due_date)}</TableCell>
                        {canManagePledges && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(pledge)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Pledge
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pledge</DialogTitle>
            <DialogDescription>
              Update pledge details for {selectedPledge && getMemberName(selectedPledge.user_id)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_amount">Pledged Amount (KES)</Label>
              <Input
                id="edit_amount"
                type="number"
                value={editPledge.amount}
                onChange={(e) => setEditPledge({ ...editPledge, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_fulfilled">Fulfilled Amount (KES)</Label>
              <Input
                id="edit_fulfilled"
                type="number"
                value={editPledge.fulfilled_amount}
                onChange={(e) =>
                  setEditPledge({ ...editPledge, fulfilled_amount: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={editPledge.status}
                onValueChange={(value) => setEditPledge({ ...editPledge, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_due_date">Due Date</Label>
              <Input
                id="edit_due_date"
                type="date"
                value={editPledge.due_date}
                onChange={(e) => setEditPledge({ ...editPledge, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={editPledge.description}
                onChange={(e) => setEditPledge({ ...editPledge, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPledge} disabled={updatePledge.isPending}>
              {updatePledge.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
