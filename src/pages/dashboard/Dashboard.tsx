import { useAuth } from '@/contexts/AuthContext';
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
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Members',
      value: '248',
      change: '+12',
      changeType: 'positive',
      icon: Users,
      href: '/dashboard/members',
    },
    {
      title: 'Monthly Contributions',
      value: 'KES 485,200',
      change: '+8.2%',
      changeType: 'positive',
      icon: Wallet,
      href: '/dashboard/contributions',
    },
    {
      title: 'YTD Collections',
      value: 'KES 4.2M',
      change: '+15%',
      changeType: 'positive',
      icon: TrendingUp,
      href: '/dashboard/reports',
    },
    {
      title: 'Pending Pledges',
      value: '34',
      change: '-5',
      changeType: 'negative',
      icon: Calendar,
      href: '/dashboard/contributions',
    },
  ];

  const recentPayments = [
    { id: 1, member: 'John Mwangi', category: 'Tithe', amount: 'KES 15,000', date: '2024-01-15' },
    { id: 2, member: 'Mary Wanjiku', category: 'Offering', amount: 'KES 2,500', date: '2024-01-15' },
    { id: 3, member: 'Peter Ochieng', category: 'Building Fund', amount: 'KES 50,000', date: '2024-01-14' },
    { id: 4, member: 'Grace Auma', category: 'Welfare', amount: 'KES 1,000', date: '2024-01-14' },
    { id: 5, member: 'Samuel Kiprop', category: 'Tithe', amount: 'KES 8,000', date: '2024-01-13' },
  ];

  const quickActions = [
    { title: 'Record Payment', icon: Plus, href: '/dashboard/contributions', variant: 'default' as const },
    { title: 'Add Member', icon: Users, href: '/dashboard/members', variant: 'outline' as const },
    { title: 'View Reports', icon: FileText, href: '/dashboard/reports', variant: 'outline' as const },
  ];

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      treasurer: 'Treasurer',
      secretary: 'Secretary',
      pastor: 'Pastor',
      member: 'Member',
    };
    return labels[role] || role;
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
                    stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
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
        {/* Recent Payments */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Contributions</CardTitle>
              <CardDescription>Latest payment records</CardDescription>
            </div>
            <Link to="/dashboard/contributions">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{payment.member}</p>
                      <p className="text-sm text-muted-foreground">{payment.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{payment.amount}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events / Activity */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription>Church calendar</CardDescription>
            </div>
            <Link to="/dashboard/events">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Sabbath Service', date: 'Saturday, Jan 20', time: '9:00 AM' },
                { title: 'Prayer Meeting', date: 'Wednesday, Jan 17', time: '6:00 PM' },
                { title: 'Youth Rally', date: 'Saturday, Jan 27', time: '2:00 PM' },
                { title: 'Board Meeting', date: 'Sunday, Jan 28', time: '10:00 AM' },
                { title: 'Camp Meeting', date: 'Feb 15-18', time: 'All Day' },
              ].map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown - Visible to Treasurer/Admin */}
      {(user?.role === 'super_admin' || user?.role === 'treasurer') && (
        <Card className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Contribution Breakdown</CardTitle>
            <CardDescription>January 2024 category summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { category: 'Tithe', amount: 'KES 285,000', percentage: 58.7, color: 'bg-primary' },
                { category: 'Offering', amount: 'KES 95,200', percentage: 19.6, color: 'bg-secondary' },
                { category: 'Building Fund', amount: 'KES 75,000', percentage: 15.5, color: 'bg-success' },
                { category: 'Welfare', amount: 'KES 30,000', percentage: 6.2, color: 'bg-warning' },
              ].map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-foreground">{item.category}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{item.amount}</p>
                  <div className="mt-2">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.percentage}% of total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
