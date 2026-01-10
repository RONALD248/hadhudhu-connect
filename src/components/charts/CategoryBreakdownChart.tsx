import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { usePayments } from '@/hooks/usePayments';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useMemo } from 'react';

interface CategoryBreakdownChartProps {
  title?: string;
  description?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(142 76% 36%)', // green
  'hsl(38 92% 50%)', // amber
  'hsl(280 65% 60%)', // purple
  'hsl(199 89% 48%)', // blue
];

export function CategoryBreakdownChart({ 
  title = "Contributions by Category",
  description = "This month's breakdown"
}: CategoryBreakdownChartProps) {
  const { data: payments, isLoading } = usePayments();

  const chartData = useMemo(() => {
    if (!payments) return [];

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthlyPayments = payments.filter(p => {
      const paymentDate = new Date(p.payment_date);
      return paymentDate >= monthStart && paymentDate <= monthEnd;
    });

    const categoryTotals = monthlyPayments.reduce((acc, p) => {
      const catName = p.payment_categories?.name || 'Other';
      acc[catName] = (acc[catName] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [payments]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

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

  const hasData = chartData.length > 0;

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
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percentage = ((data.value / total) * 100).toFixed(1);
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            KES {Number(data.value).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {percentage}% of total
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No category data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Charts will appear when contributions are recorded
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}