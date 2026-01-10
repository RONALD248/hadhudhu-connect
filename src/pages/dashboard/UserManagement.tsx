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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Shield,
  Loader2,
  UserCog,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsersWithRoles, useUpdateUserRole, AppRole } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';
import { ApprovedEmailsDialog } from '@/components/admin/ApprovedEmailsDialog';

const roleColors: Record<AppRole, string> = {
  super_admin: 'bg-destructive/10 text-destructive',
  treasurer: 'bg-primary/10 text-primary',
  secretary: 'bg-success/10 text-success',
  pastor: 'bg-warning/10 text-warning',
  elder: 'bg-secondary/10 text-secondary-foreground',
  member: 'bg-muted text-muted-foreground',
};

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  treasurer: 'Treasurer',
  secretary: 'Secretary',
  pastor: 'Pastor',
  elder: 'Elder',
  member: 'Member',
};

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ userId: string; currentRole: AppRole } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('member');
  
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsersWithRoles();
  const updateRole = useUpdateUserRole();

  const filteredUsers = users?.filter(user => {
    const fullName = `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  }) || [];

  const handleRoleChange = () => {
    if (selectedUser) {
      updateRole.mutate({ userId: selectedUser.userId, newRole });
      setSelectedUser(null);
    }
  };

  const stats = {
    total: users?.length || 0,
    admins: users?.filter(u => u.role === 'super_admin').length || 0,
    staff: users?.filter(u => ['treasurer', 'secretary', 'pastor'].includes(u.role)).length || 0,
    members: users?.filter(u => u.role === 'member').length || 0,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Assign roles to control access to system features</p>
        </div>
        <ApprovedEmailsDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-primary' },
          { label: 'Administrators', value: stats.admins, icon: Shield, color: 'text-destructive' },
          { label: 'Staff', value: stats.staff, icon: UserCog, color: 'text-success' },
          { label: 'Members', value: stats.members, icon: Users, color: 'text-muted-foreground' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Role Assignment Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Treasurer:</strong> Manages payments, contribution categories, and financial reports.</p>
          <p><strong>Secretary:</strong> Registers church members, manages records, and generates reports.</p>
          <p><strong>Pastor:</strong> Views member information and contribution summaries.</p>
          <p><strong>Member:</strong> Views their own contributions and profile.</p>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead className="w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.user_id === currentUser?.id;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {user.profile?.first_name?.[0] || '?'}{user.profile?.last_name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">
                              {user.profile?.first_name} {user.profile?.last_name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground ml-2">(You)</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.profile?.phone || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={roleColors[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isCurrentUser}
                          onClick={() => {
                            setSelectedUser({ userId: user.user_id, currentRole: user.role });
                            setNewRole(user.role);
                          }}
                        >
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for this user. This will change their access permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {newRole === 'secretary' && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Secretary role requires an approved church email. If the user's email is not approved, the change will fail.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="treasurer">Treasurer</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="pastor">Pastor</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleRoleChange} disabled={updateRole.isPending}>
                {updateRole.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Role'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
