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
  Filter, 
  Download, 
  MoreHorizontal,
  Phone,
  Edit,
  Trash2,
  Eye,
  Loader2,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useProfiles, useCreateProfile } from '@/hooks/useProfiles';
import { useDepartments } from '@/hooks/useDepartments';
import { useAuth } from '@/contexts/AuthContext';
import { exportMembersToPDF } from '@/lib/pdfExport';

export default function Members() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state for new member
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
    marital_status: '',
    address: '',
    occupation: '',
    baptism_date: '',
    membership_number: '',
  });
  
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: departments } = useDepartments();
  const createProfile = useCreateProfile();

  const canRegisterMembers = user?.role === 'super_admin' || user?.role === 'secretary';

  const filteredMembers = profiles?.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.membership_number?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusBadge = (baptismDate: string | null) => {
    if (baptismDate) {
      return { status: 'baptized', style: 'bg-success/10 text-success hover:bg-success/20' };
    }
    return { status: 'visitor', style: 'bg-warning/10 text-warning hover:bg-warning/20' };
  };

  const generateMembershipNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `HAD-${year}-${random}`;
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.phone) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in first name, last name, and phone number.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createProfile.mutateAsync({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        gender: formData.gender || null,
        marital_status: formData.marital_status || null,
        address: formData.address || null,
        occupation: formData.occupation || null,
        baptism_date: formData.baptism_date || null,
        membership_number: formData.membership_number || generateMembershipNumber(),
        is_active: true,
      });
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        gender: '',
        marital_status: '',
        address: '',
        occupation: '',
        baptism_date: '',
        membership_number: '',
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleExportPDF = () => {
    if (filteredMembers.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no members to export.',
        variant: 'destructive',
      });
      return;
    }
    exportMembersToPDF(filteredMembers);
    toast({
      title: 'PDF exported',
      description: 'Member list has been downloaded as PDF.',
    });
  };

  const handleViewMember = (member: any) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const stats = {
    total: profiles?.length || 0,
    baptized: profiles?.filter(p => p.baptism_date).length || 0,
    visitors: profiles?.filter(p => !p.baptism_date).length || 0,
    active: profiles?.filter(p => p.is_active).length || 0,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">Manage church member records</p>
        </div>

        {canRegisterMembers && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Register Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Member</DialogTitle>
                <DialogDescription>
                  Add a new church member to the system. This will create a member record.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input 
                      id="first_name" 
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      placeholder="John" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input 
                      id="last_name" 
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      placeholder="Mwangi" 
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+254 7XX XXX XXX" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="membership_number">Membership Number</Label>
                    <Input 
                      id="membership_number" 
                      value={formData.membership_number}
                      onChange={(e) => setFormData({...formData, membership_number: e.target.value})}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={formData.gender}
                      onValueChange={(v) => setFormData({...formData, gender: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <Select 
                      value={formData.marital_status}
                      onValueChange={(v) => setFormData({...formData, marital_status: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baptism_date">Baptism Date</Label>
                    <Input 
                      id="baptism_date" 
                      type="date" 
                      value={formData.baptism_date}
                      onChange={(e) => setFormData({...formData, baptism_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input 
                      id="occupation" 
                      value={formData.occupation}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                      placeholder="Teacher, Farmer, etc."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Physical address"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createProfile.isPending}>
                    {createProfile.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Register Member'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Members', value: stats.total.toString(), color: 'text-primary' },
          { label: 'Baptized', value: stats.baptized.toString(), color: 'text-success' },
          { label: 'Visitors', value: stats.visitors.toString(), color: 'text-warning' },
          { label: 'Active', value: stats.active.toString(), color: 'text-muted-foreground' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
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
                placeholder="Search by name or membership number..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          {profilesLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground">No members found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {canRegisterMembers 
                  ? 'Click "Register Member" to add a new member.'
                  : 'Members will appear here when they are registered.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Membership No.</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Gender</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const { status, style } = getStatusBadge(member.baptism_date);
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {member.first_name[0]}{member.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.first_name} {member.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {member.membership_number || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          {member.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={style}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell capitalize">
                        {member.gender || '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewMember(member)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            {canRegisterMembers && (
                              <>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Member Profile</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedMember.first_name[0]}{selectedMember.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedMember.first_name} {selectedMember.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedMember.membership_number || 'No membership number'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedMember.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{selectedMember.gender || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Marital Status</p>
                  <p className="font-medium capitalize">{selectedMember.marital_status || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="secondary" className={getStatusBadge(selectedMember.baptism_date).style}>
                    {getStatusBadge(selectedMember.baptism_date).status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedMember.address || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Occupation</p>
                  <p className="font-medium">{selectedMember.occupation || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Baptism Date</p>
                  <p className="font-medium">
                    {selectedMember.baptism_date 
                      ? new Date(selectedMember.baptism_date).toLocaleDateString() 
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
