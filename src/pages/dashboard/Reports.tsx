import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download,
  Wallet,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Loader2,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { usePayments, usePaymentCategories } from '@/hooks/usePayments';
import { useProfiles } from '@/hooks/useProfiles';
import { format, startOfMonth, subMonths, parseISO } from 'date-fns';

export default function Reports() {
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const { data: categories = [] } = usePaymentCategories();
  const { data: profiles = [] } = useProfiles();

  const currentYear = new Date().getFullYear();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate monthly data from actual payments
  const monthlyData = useMemo(() => {
    const months: { month: string; total: number; byCategory: Record<string, number> }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthLabel = format(date, 'MMM');
      const monthStr = format(date, 'yyyy-MM');
      
      const monthPayments = payments.filter(p => p.payment_date.startsWith(monthStr));
      const byCategory: Record<string, number> = {};
      
      monthPayments.forEach(p => {
        const catName = p.payment_categories?.name || 'Other';
        byCategory[catName] = (byCategory[catName] || 0) + Number(p.amount);
      });
      
      months.push({
        month: monthLabel,
        total: monthPayments.reduce((sum, p) => sum + Number(p.amount), 0),
        byCategory,
      });
    }
    
    return months;
  }, [payments]);

  // Calculate category totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    const yearPayments = payments.filter(p => p.payment_date.startsWith(currentYear.toString()));
    
    yearPayments.forEach(p => {
      const catName = p.payment_categories?.name || 'Other';
      totals[catName] = (totals[catName] || 0) + Number(p.amount);
    });
    
    const grandTotal = Object.values(totals).reduce((sum, v) => sum + v, 0);
    const colors = ['bg-primary', 'bg-success', 'bg-secondary', 'bg-warning', 'bg-destructive', 'bg-accent'];
    
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], i) => ({
        name,
        amount,
        percentage: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
        color: colors[i % colors.length],
      }));
  }, [payments, currentYear]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const yearPayments = payments.filter(p => p.payment_date.startsWith(currentYear.toString()));
    const totalAmount = yearPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const uniqueContributors = new Set(yearPayments.map(p => p.user_id)).size;
    
    // Find highest month
    let highestMonth = '';
    let highestAmount = 0;
    monthlyData.forEach(m => {
      if (m.total > highestAmount) {
        highestAmount = m.total;
        highestMonth = m.month;
      }
    });
    
    const monthsWithData = monthlyData.filter(m => m.total > 0).length;
    const avgMonthly = monthsWithData > 0 ? totalAmount / monthsWithData : 0;
    
    return {
      avgMonthly,
      highestMonth: highestMonth ? `${highestMonth} ${currentYear}` : 'N/A',
      highestAmount,
      activeContributors: uniqueContributors,
      totalYTD: totalAmount,
    };
  }, [payments, monthlyData, currentYear]);

  const maxMonthlyTotal = Math.max(...monthlyData.map(m => m.total), 1);

  if (paymentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Financial reports from actual contribution data</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Collection Trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No payment data yet</p>
                <p className="text-sm text-muted-foreground mt-1">Record contributions to see trends here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {monthlyData.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-muted-foreground">{formatCurrency(month.total)}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all rounded-full"
                        style={{ width: `${(month.total / maxMonthlyTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
            <CardDescription>{currentYear} year-to-date breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryTotals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <PieChart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No category data yet</p>
                <p className="text-sm text-muted-foreground mt-1">Contributions will be broken down by category</p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {categoryTotals.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${category.color}`} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatCurrency(category.amount)}</span>
                          <span className="text-sm text-muted-foreground ml-2">({category.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div 
                          className={`h-2 rounded-full ${category.color} transition-all`}
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total YTD</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(categoryTotals.reduce((sum, cat) => sum + cat.amount, 0))}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Average Monthly Collection', value: formatCurrency(metrics.avgMonthly) },
              { label: 'Highest Collection Month', value: metrics.highestMonth, subtext: metrics.highestAmount > 0 ? formatCurrency(metrics.highestAmount) : undefined },
              { label: 'Active Contributors', value: metrics.activeContributors.toString() },
              { label: 'Total Members', value: profiles.length.toString() },
            ].map((metric, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-xl font-bold mt-1">{metric.value}</p>
                {metric.subtext && (
                  <p className="text-sm text-muted-foreground mt-1">{metric.subtext}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
