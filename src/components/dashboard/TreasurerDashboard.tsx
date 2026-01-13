import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePayments, usePaymentCategories, usePledges } from '@/hooks/usePayments';
import { useProfiles } from '@/hooks/useProfiles';
import { ContributionTrendChart } from '@/components/charts/ContributionTrendChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { exportDashboardReport } from '@/lib/pdfExport';
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  Plus,
  PieChart,
  Users,
  ArrowUpRight,
  FileDown,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { format, startOfMonth, startOfYear, subMonths, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export function TreasurerDashboard() {
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: categories } = usePaymentCategories();
  const { data: profiles } = useProfiles();
  const { data: pledges } = usePledges();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  const monthlyPayments = payments?.filter(p => new Date(p.payment_date) >= monthStart) || [];
  const yearlyPayments = payments?.filter(p => new Date(p.payment_date) >= yearStart) || [];

  const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const yearlyTotal = yearlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalContributions = payments?.length || 0;
  const activeCategories = categories?.length || 0;

  const recentPayments = payments?.slice(0, 5) || [];

  // Pledge stats
  const totalPledges = pledges?.length || 0;
  const activePledges = pledges?.filter(p => p.status === 'pending' || p.status === 'partial') || [];
  const fulfilledPledges = pledges?.filter(p => p.status === 'fulfilled') || [];
  const totalPledgedAmount = pledges?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalFulfilledAmount = pledges?.reduce((sum, p) => sum + Number(p.fulfilled_amount || 0), 0) || 0;
  const pledgeFulfillmentRate = totalPledgedAmount > 0 ? (totalFulfilledAmount / totalPledgedAmount) * 100 : 0;

  // Payment method breakdown
  const paymentMethods = monthlyPayments.reduce((acc, p) => {
    acc[p.payment_method] = (acc[p.payment_method] || 0) + Number(p.amount);
    return acc;
  }, {} as Record<string, number>);

  // Category breakdown for the month
  const categoryBreakdown = monthlyPayments.reduce((acc, p) => {
    const catName = p.payment_categories?.name || 'Unknown';
    acc[catName] = (acc[catName] || 0) + Number(p.amount);
    return acc;
  }, {} as Record<string, number>);

  // Calculate month-over-month growth
  const lastMonthStart = subMonths(monthStart, 1);
  const lastMonthPayments = payments?.filter(p => {
    const date = new Date(p.payment_date);
    return date >= lastMonthStart && date < monthStart;
  }) || [];
  const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const growthRate = lastMonthTotal > 0 ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
  const growthText = growthRate > 0 ? `+${growthRate.toFixed(0)}%` : `${growthRate.toFixed(0)}%`;

  const stats = [
    {
      title: 'Monthly Collections',
      value: paymentsLoading ? '...' : `KES ${monthlyTotal.toLocaleString()}`,
      icon: Wallet,
      href: '/dashboard/contributions',
      description: `${monthlyPayments.length} payments`,
      trend: lastMonthTotal > 0 ? growthText : undefined,
      trendUp: growthRate > 0,
    },
    {
      title: 'YTD Collections',
      value: paymentsLoading ? '...' : `KES ${yearlyTotal.toLocaleString()}`,
      icon: TrendingUp,
      href: '/dashboard/reports',
      description: `${yearlyPayments.length} payments`,
    },
    {
      title: 'Active Pledges',
      value: activePledges.length.toString(),
      icon: Target,
      href: '/dashboard/contributions',
      description: `KES ${(totalPledgedAmount - totalFulfilledAmount).toLocaleString()} pending`,
    },
    {
      title: 'Active Categories',
      value: activeCategories.toString(),
      icon: PieChart,
      href: '/dashboard/categories',
      description: 'Payment categories',
    },
  ];

  const quickActions = [
    { title: 'Record Payment', icon: Plus, href: '/dashboard/contributions', variant: 'default' as const },
    { title: 'Payment Categories', icon: CreditCard, href: '/dashboard/categories', variant: 'outline' as const },
    { title: 'View Reports', icon: PieChart, href: '/dashboard/reports', variant: 'outline' as const },
    { title: 'View Members', icon: Users, href: '/dashboard/members', variant: 'outline' as const },
  ];

  const handleExportPDF = () => {
    // Generate contribution trend data
    const contributionTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthPaymentsFiltered = payments?.filter(p => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate.getMonth() === monthDate.getMonth() && 
               paymentDate.getFullYear() === monthDate.getFullYear();
      }) || [];
      contributionTrend.push({
        label: format(monthDate, 'MMM yyyy'),
        value: monthPaymentsFiltered.reduce((sum, p) => sum + Number(p.amount), 0)
      });
    }

    // Category breakdown for PDF
    const categoryBreakdownForPDF = Object.entries(categoryBreakdown).map(
      ([label, value]) => ({ label, value })
    );

    // Recent payments for report
    const recentPaymentsForReport = recentPayments.map(p => ({
      payment_date: p.payment_date,
      amount: p.amount,
      payment_method: formatPaymentMethod(p.payment_method),
      reference_number: p.reference_number,
      category: p.payment_categories ? { name: p.payment_categories.name } : null,
    }));

    exportDashboardReport({
      reportTitle: 'Treasury Report',
      stats: [
        { title: 'Monthly Collections', value: `KES ${monthlyTotal.toLocaleString()}`, description: `${monthlyPayments.length} payments` },
        { title: 'YTD Collections', value: `KES ${yearlyTotal.toLocaleString()}`, description: `${yearlyPayments.length} payments` },
        { title: 'Total Contributions', value: totalContributions.toString(), description: 'All time records' },
        { title: 'Active Categories', value: activeCategories.toString(), description: 'Payment categories' },
        { title: 'Total Pledges', value: totalPledges.toString(), description: `${pledgeFulfillmentRate.toFixed(0)}% fulfilled` },
      ],
      contributionTrend,
      categoryBreakdown: categoryBreakdownForPDF,
      recentPayments: recentPaymentsForReport,
      additionalNotes: 'This treasury report summarizes all financial contributions and payment activities.',
    });
    toast.success('Treasury report exported successfully');
  };

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Cash',
      mpesa: 'M-Pesa',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque',
    };
    return methods[method] || method;
  };

  const getPledgeStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'bg-green-100 text-green-700';
      case 'partial': return 'bg-amber-100 text-amber-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export Report
        </Button>
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
                  {stat.trend && (
                    <Badge variant="secondary" className={stat.trendUp ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}>
                      <ArrowUpRight className={`h-3 w-3 mr-1 ${!stat.trendUp && 'rotate-90'}`} />
                      {stat.trend}
                    </Badge>
                  )}
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

      {/* Pledge Progress Overview */}
      {totalPledges > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Pledge Fulfillment Overview
            </CardTitle>
            <CardDescription>Track pledge progress and pending amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Fulfillment Rate</p>
                  <p className="text-2xl font-bold">{pledgeFulfillmentRate.toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Pledged</p>
                  <p className="font-semibold">KES {totalPledgedAmount.toLocaleString()}</p>
                </div>
              </div>
              <Progress value={pledgeFulfillmentRate} className="h-3" />
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 rounded-lg bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-700">{fulfilledPledges.length}</p>
                  <p className="text-xs text-green-600">Fulfilled</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50">
                  <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-amber-700">{activePledges.filter(p => p.status === 'partial').length}</p>
                  <p className="text-xs text-amber-600">Partial</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <AlertCircle className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-700">{activePledges.filter(p => p.status === 'pending').length}</p>
                  <p className="text-xs text-blue-600">Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <Card>
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
            {recentPayments.length > 0 ? (
              <div className="space-y-3">
                {recentPayments.map((payment) => {
                  const profile = profiles?.find(p => p.user_id === payment.user_id);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-foreground">
                          {profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_categories?.name} • {format(new Date(payment.payment_date), 'PP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">KES {Number(payment.amount).toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">
                          {formatPaymentMethod(payment.payment_method)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wallet className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No contributions recorded yet</p>
                <Link to="/dashboard/contributions" className="mt-2">
                  <Button size="sm">Record First Payment</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
            <CardDescription>Collections by category this month</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(categoryBreakdown).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = monthlyTotal > 0 ? (amount / monthlyTotal) * 100 : 0;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span className="text-muted-foreground">KES {amount.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <PieChart className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No data for this month</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ContributionTrendChart 
          months={6} 
          title="Revenue Trends" 
          description="Monthly collections over 6 months" 
        />
        <CategoryBreakdownChart 
          title="Category Distribution" 
          description="This month's contribution breakdown" 
        />
      </div>

      {/* Active Pledges Section */}
      {activePledges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Pledges</CardTitle>
            <CardDescription>Pledges awaiting fulfillment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activePledges.slice(0, 5).map((pledge) => {
                const profile = profiles?.find(p => p.user_id === pledge.user_id);
                const fulfillmentPercent = pledge.amount > 0 
                  ? ((pledge.fulfilled_amount || 0) / pledge.amount) * 100 
                  : 0;
                const daysUntilDue = pledge.due_date 
                  ? differenceInDays(new Date(pledge.due_date), now) 
                  : null;
                
                return (
                  <div key={pledge.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          {profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Member'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pledge.payment_categories?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getPledgeStatusColor(pledge.status)}>
                          {pledge.status}
                        </Badge>
                        {daysUntilDue !== null && (
                          <p className={`text-xs mt-1 ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue < 7 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>KES {(pledge.fulfilled_amount || 0).toLocaleString()} of KES {pledge.amount.toLocaleString()}</span>
                        <span className="font-medium">{fulfillmentPercent.toFixed(0)}%</span>
                      </div>
                      <Progress value={fulfillmentPercent} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods Summary */}
      {Object.keys(paymentMethods).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods</CardTitle>
            <CardDescription>How members are paying this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {Object.entries(paymentMethods).map(([method, amount]) => (
                <div key={method} className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">{formatPaymentMethod(method)}</p>
                  <p className="text-xl font-bold text-foreground">KES {amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}