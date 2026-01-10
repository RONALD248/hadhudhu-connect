import { useAuth } from '@/contexts/AuthContext';
import { SecretaryDashboard } from '@/components/dashboard/SecretaryDashboard';
import { TreasurerDashboard } from '@/components/dashboard/TreasurerDashboard';
import { PastorDashboard } from '@/components/dashboard/PastorDashboard';
import { ElderDashboard } from '@/components/dashboard/ElderDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      treasurer: 'Treasurer',
      secretary: 'Church Secretary',
      pastor: 'Pastor',
      elder: 'Church Elder',
      member: 'Member',
    };
    return labels[role] || role;
  };

  // Render role-specific dashboards
  const renderRoleDashboard = () => {
    switch (user?.role) {
      case 'secretary':
        return <SecretaryDashboard />;
      case 'treasurer':
        return <TreasurerDashboard />;
      case 'pastor':
        return <PastorDashboard />;
      case 'elder':
        return <ElderDashboard />;
      case 'super_admin':
        return <AdminDashboard />;
      default:
        return <MemberDashboard />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="page-subtitle">
          {getRoleLabel(user?.role || '')} Dashboard • Hadhudhu SDA Church
        </p>
      </div>

      {renderRoleDashboard()}
    </div>
  );
}

// Admin Dashboard - full access to everything
function AdminDashboard() {
  const stats = [
    {
      title: 'Total Members',
      value: '--',
      change: 'View',
      changeType: 'neutral',
      icon: Users,
      href: '/dashboard/members',
    },
    {
      title: 'Monthly Contributions',
      value: '--',
      change: 'View',
      changeType: 'neutral',
      icon: Wallet,
      href: '/dashboard/contributions',
    },
    {
      title: 'YTD Collections',
      value: '--',
      change: 'View',
      changeType: 'neutral',
      icon: TrendingUp,
      href: '/dashboard/reports',
    },
    {
      title: 'Pending Pledges',
      value: '--',
      change: 'View',
      changeType: 'neutral',
      icon: Calendar,
      href: '/dashboard/contributions',
    },
  ];

  const quickActions = [
    { title: 'Record Payment', icon: Plus, href: '/dashboard/contributions', variant: 'default' as const },
    { title: 'Add Member', icon: Users, href: '/dashboard/members', variant: 'outline' as const },
    { title: 'View Reports', icon: FileText, href: '/dashboard/reports', variant: 'outline' as const },
  ];

  return (
    <>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.href}>
            <Button variant={action.variant} className="gap-2">
              <action.icon className="h-4 w-4" />
              {action.title}
            </Button>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="stat-card cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-success' : stat.changeType === 'negative' ? 'text-destructive' : 'text-primary'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : stat.changeType === 'negative' ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : null}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Contributions</CardTitle>
              <CardDescription>Latest payment records</CardDescription>
            </div>
            <Link to="/dashboard/contributions">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">No contributions recorded yet</p>
              <Link to="/dashboard/contributions" className="mt-4">
                <Button size="sm">Record First Contribution</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
            <CardDescription>Navigate to key areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/dashboard/members" className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Member Registration</p>
                  <p className="text-sm text-muted-foreground">Add new church members</p>
                </div>
              </Link>
              <Link to="/dashboard/contributions" className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Payment Recording</p>
                  <p className="text-sm text-muted-foreground">Record contributions</p>
                </div>
              </Link>
              <Link to="/dashboard/users" className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">User Management</p>
                  <p className="text-sm text-muted-foreground">Manage system users</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Member Dashboard - limited view
function MemberDashboard() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">My Contributions</CardTitle>
              <CardDescription>Your payment history</CardDescription>
            </div>
            <Link to="/dashboard/contributions">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">Your contribution history will appear here</p>
              <Link to="/dashboard/contributions" className="mt-4">
                <Button size="sm">View Payment Instructions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
            <CardDescription>Navigate to key areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/dashboard/contributions" className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">My Contributions</p>
                  <p className="text-sm text-muted-foreground">View contribution details</p>
                </div>
              </Link>
              <Link to="/dashboard/settings" className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">My Profile</p>
                  <p className="text-sm text-muted-foreground">Update your information</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
