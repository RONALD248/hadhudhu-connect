import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfiles } from '@/hooks/useProfiles';
import { useDepartments } from '@/hooks/useDepartments';
import { useChurchServices, useAttendanceStats } from '@/hooks/useAttendance';
import { 
  Users, 
  Building2, 
  ClipboardCheck, 
  UserPlus,
  FolderOpen,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function SecretaryDashboard() {
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: departments } = useDepartments();
  const { data: services } = useChurchServices();
  const { data: attendanceStats } = useAttendanceStats(
    format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  const totalMembers = profiles?.length || 0;
  const activeMembers = profiles?.filter(p => p.is_active)?.length || 0;
  const baptizedMembers = profiles?.filter(p => p.baptism_date)?.length || 0;
  const activeDepartments = departments?.filter(d => d.is_active)?.length || 0;
  const recentServices = services?.slice(0, 5) || [];

  const stats = [
    {
      title: 'Total Members',
      value: profilesLoading ? '...' : totalMembers.toString(),
      icon: Users,
      href: '/dashboard/members',
      description: `${activeMembers} active`,
    },
    {
      title: 'Baptized Members',
      value: profilesLoading ? '...' : baptizedMembers.toString(),
      icon: TrendingUp,
      href: '/dashboard/secretariat',
      description: `${Math.round((baptizedMembers / totalMembers) * 100) || 0}% of total`,
    },
    {
      title: 'Departments',
      value: activeDepartments.toString(),
      icon: Building2,
      href: '/dashboard/departments',
      description: 'Active departments',
    },
    {
      title: 'Avg Attendance',
      value: attendanceStats?.averageAttendance?.toString() || '0',
      icon: ClipboardCheck,
      href: '/dashboard/attendance',
      description: 'This month',
    },
  ];

  const quickActions = [
    { title: 'Register Member', icon: UserPlus, href: '/dashboard/members', variant: 'default' as const },
    { title: 'Record Attendance', icon: ClipboardCheck, href: '/dashboard/attendance', variant: 'outline' as const },
    { title: 'View Secretariat', icon: FolderOpen, href: '/dashboard/secretariat', variant: 'outline' as const },
    { title: 'Manage Departments', icon: Building2, href: '/dashboard/departments', variant: 'outline' as const },
  ];

  return (
    <div className="space-y-6">
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
              <CardDescription>Latest church services</CardDescription>
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
                <Link to="/dashboard/attendance" className="mt-2">
                  <Button size="sm">Create First Service</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Secretary Tasks</CardTitle>
            <CardDescription>Common secretariat activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/dashboard/members" className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Member Registration</p>
                  <p className="text-sm text-muted-foreground">Add new church members</p>
                </div>
              </Link>
              <Link to="/dashboard/attendance" className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Attendance Tracking</p>
                  <p className="text-sm text-muted-foreground">Record service attendance</p>
                </div>
              </Link>
              <Link to="/dashboard/departments" className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Department Management</p>
                  <p className="text-sm text-muted-foreground">Organize church departments</p>
                </div>
              </Link>
              <Link to="/dashboard/reports" className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Generate Reports</p>
                  <p className="text-sm text-muted-foreground">Member and attendance reports</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
