import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfiles } from '@/hooks/useProfiles';
import { usePayments } from '@/hooks/usePayments';
import { useChurchServices, useAttendanceStats } from '@/hooks/useAttendance';
import { useDepartments } from '@/hooks/useDepartments';
import { 
  Users, 
  Wallet, 
  ClipboardCheck, 
  TrendingUp,
  Building2,
  PieChart,
  Eye,
  CalendarDays,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear } from 'date-fns';

export function ElderDashboard() {
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: payments } = usePayments();
  const { data: departments } = useDepartments();
  const { data: services } = useChurchServices();
  const { data: attendanceStats } = useAttendanceStats(
    format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  const now = new Date();
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  const totalMembers = profiles?.length || 0;
  const activeMembers = profiles?.filter(p => p.is_active)?.length || 0;
  const monthlyPayments = payments?.filter(p => new Date(p.payment_date) >= monthStart) || [];
  const yearlyPayments = payments?.filter(p => new Date(p.payment_date) >= yearStart) || [];
  const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const yearlyTotal = yearlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const activeDepartments = departments?.filter(d => d.is_active)?.length || 0;
  const recentServices = services?.slice(0, 5) || [];

  const stats = [
    {
      title: 'Church Members',
      value: profilesLoading ? '...' : totalMembers.toString(),
      icon: Users,
      href: '/dashboard/members',
      description: `${activeMembers} active members`,
    },
    {
      title: 'Monthly Collections',
      value: `KES ${monthlyTotal.toLocaleString()}`,
      icon: Wallet,
      href: '/dashboard/contributions',
      description: `${monthlyPayments.length} contributions`,
    },
    {
      title: 'YTD Collections',
      value: `KES ${yearlyTotal.toLocaleString()}`,
      icon: TrendingUp,
      href: '/dashboard/reports',
      description: `${yearlyPayments.length} total`,
    },
    {
      title: 'Avg Attendance',
      value: attendanceStats?.averageAttendance?.toString() || '0',
      icon: ClipboardCheck,
      href: '/dashboard/attendance',
      description: 'Per service this month',
    },
  ];

  const quickActions = [
    { title: 'View Members', icon: Users, href: '/dashboard/members', variant: 'default' as const },
    { title: 'View Contributions', icon: Wallet, href: '/dashboard/contributions', variant: 'outline' as const },
    { title: 'View Attendance', icon: ClipboardCheck, href: '/dashboard/attendance', variant: 'outline' as const },
    { title: 'View Reports', icon: PieChart, href: '/dashboard/reports', variant: 'outline' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Role Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          <Eye className="h-3 w-3 mr-1" />
          Oversight View
        </Badge>
        <span className="text-sm text-muted-foreground">Read-only access to church data</span>
      </div>

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
            <Card className="stat-card cursor-pointer animate-slide-up hover:shadow-lg transition-shadow" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm font-medium text-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Services</CardTitle>
              <CardDescription>Church services and attendance</CardDescription>
            </div>
            <Link to="/dashboard/attendance">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentServices.length > 0 ? (
              <div className="space-y-3">
                {recentServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{service.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(service.service_date), 'PPP')}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {service.service_type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No services recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Church Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Church Overview</CardTitle>
            <CardDescription>General church statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Total Members</p>
                    <p className="text-sm text-muted-foreground">{activeMembers} active</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{totalMembers}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Departments</p>
                    <p className="text-sm text-muted-foreground">Active ministries</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{activeDepartments}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">YTD Collections</p>
                    <p className="text-sm text-muted-foreground">{yearlyPayments.length} contributions</p>
                  </div>
                </div>
                <span className="text-xl font-bold">KES {yearlyTotal.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Services This Month</p>
                    <p className="text-sm text-muted-foreground">{attendanceStats?.totalAttendance || 0} total attendance</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{attendanceStats?.totalServices || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}