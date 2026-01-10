import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePayments } from '@/hooks/usePayments';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useMemo } from 'react';

interface ContributionTrendChartProps {
  months?: number;
  title?: string;
  description?: string;
}

export function ContributionTrendChart({ 
  months = 6, 
  title = "Contribution Trends",
  description = "Monthly collections over time"
}: ContributionTrendChartProps) {
  const { data: payments, isLoading } = usePayments();

  const chartData = useMemo(() => {
    if (!payments) return [];

    const now = new Date();
    const monthsData = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });

      const total = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const count = monthPayments.length;

      monthsData.push({
        month: format(monthDate, 'MMM'),
        fullMonth: format(monthDate, 'MMMM yyyy'),
        amount: total,
        count,
      });
    }

    return monthsData;
  }, [payments, months]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = chartData.some(d => d.amount > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-medium">{data.fullMonth}</p>
                          <p className="text-sm text-muted-foreground">
                            KES {Number(data.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.count} contributions
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No contribution data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Charts will appear when contributions are recorded
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}