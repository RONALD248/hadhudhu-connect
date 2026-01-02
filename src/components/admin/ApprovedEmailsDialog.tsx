import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Trash2, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { useApprovedEmails, useAddApprovedEmail, useDeleteApprovedEmail, AppRole } from '@/hooks/useApprovedEmails';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  treasurer: 'Treasurer',
  secretary: 'Secretary',
  pastor: 'Pastor',
  member: 'Member',
};

const roleColors: Record<AppRole, string> = {
  super_admin: 'bg-destructive/10 text-destructive',
  treasurer: 'bg-primary/10 text-primary',
  secretary: 'bg-success/10 text-success',
  pastor: 'bg-warning/10 text-warning',
  member: 'bg-muted text-muted-foreground',
};

export function ApprovedEmailsDialog() {
  const [open, setOpen] = useState(false);
  const [emailPattern, setEmailPattern] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('secretary');
  const [description, setDescription] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: approvedEmails, isLoading } = useApprovedEmails();
  const addEmail = useAddApprovedEmail();
  const deleteEmail = useDeleteApprovedEmail();

  const handleAdd = () => {
    if (!emailPattern.trim()) return;
    
    addEmail.mutate({
      emailPattern: emailPattern.trim(),
      role: selectedRole,
      description: description.trim() || undefined,
    }, {
      onSuccess: () => {
        setEmailPattern('');
        setDescription('');
      }
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteEmail.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const secretaryEmails = approvedEmails?.filter(e => e.role === 'secretary') || [];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Approved Emails
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Approved Church Emails
            </DialogTitle>
            <DialogDescription>
              Control which email addresses can be assigned to sensitive roles like Secretary.
              Only users with approved emails can be given the Secretary role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Warning Banner */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Security Notice</p>
                <p className="text-muted-foreground mt-1">
                  The Secretary role has access to all member personal data. Only add official church email addresses here.
                  You can use exact emails (e.g., secretary@church.org) or patterns (e.g., %@church.org for all church domain emails).
                </p>
              </div>
            </div>

            {/* Add New Email Form */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium">Add Approved Email</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email-pattern">Email or Pattern</Label>
                  <Input
                    id="email-pattern"
                    placeholder="e.g., secretary@church.org or %@church.org"
                    value={emailPattern}
                    onChange={(e) => setEmailPattern(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use % as wildcard (e.g., %@church.org matches all church emails)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secretary">Secretary</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Currently only Secretary role requires email approval
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Main church secretary email"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleAdd} 
                disabled={!emailPattern.trim() || addEmail.isPending}
                className="gap-2"
              >
                {addEmail.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Approved Email
              </Button>
            </div>

            {/* Approved Emails List */}
            <div className="space-y-3">
              <h3 className="font-medium">Approved Secretary Emails ({secretaryEmails.length})</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : secretaryEmails.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-muted/20">
                  <Mail className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No approved emails yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add church email addresses above to restrict Secretary role assignment
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email Pattern</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {secretaryEmails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell className="font-mono text-sm">
                          {email.email_pattern}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={roleColors[email.role]}>
                            {roleLabels[email.role]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {email.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(email.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Approved Email?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent users with this email from being assigned the Secretary role.
              Existing role assignments will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
