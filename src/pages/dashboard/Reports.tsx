import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Download,
  FileText,
  TrendingUp,
  Users,
  Wallet,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

export default function Reports() {
  const reportTypes = [
    {
      title: 'Financial Summary',
      description: 'Complete overview of all contributions',
      icon: Wallet,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Tithe Report',
      description: 'Detailed tithe collection report',
      icon: TrendingUp,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Member Contributions',
      description: 'Individual member contribution history',
      icon: Users,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      title: 'Category Breakdown',
      description: 'Contributions by category',
      icon: PieChart,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Monthly Comparison',
      description: 'Month-over-month analysis',
      icon: BarChart3,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Annual Report',
      description: 'Yearly financial overview',
      icon: Calendar,
      color: 'bg-destructive/10 text-destructive',
    },
  ];

  const monthlyData = [
    { month: 'Jan', tithe: 285000, offering: 95200, building: 75000, welfare: 30000 },
    { month: 'Feb', tithe: 265000, offering: 88000, building: 82000, welfare: 25000 },
    { month: 'Mar', tithe: 295000, offering: 102000, building: 68000, welfare: 35000 },
    { month: 'Apr', tithe: 278000, offering: 91000, building: 90000, welfare: 28000 },
    { month: 'May', tithe: 310000, offering: 98000, building: 85000, welfare: 32000 },
    { month: 'Jun', tithe: 325000, offering: 105000, building: 95000, welfare: 38000 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const categoryTotals = [
    { name: 'Tithe', amount: 1758000, percentage: 58.7, color: 'bg-primary' },
    { name: 'Offering', amount: 579200, percentage: 19.3, color: 'bg-success' },
    { name: 'Building Fund', amount: 495000, percentage: 16.5, color: 'bg-secondary' },
    { name: 'Welfare', amount: 188000, percentage: 6.3, color: 'bg-warning' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and view financial reports</p>
        </div>

        <div className="flex gap-2">
          <Select defaultValue="2024">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report, index) => (
          <Card key={index} className="cursor-pointer transition-all hover:shadow-card-hover hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`h-12 w-12 rounded-lg ${report.color} flex items-center justify-center`}>
                  <report.icon className="h-6 w-6" />
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-foreground">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Collection Trend</CardTitle>
            <CardDescription>Jan - Jun 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => {
                const total = month.tithe + month.offering + month.building + month.welfare;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-muted-foreground">{formatCurrency(total)}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(month.tithe / total) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-success transition-all"
                        style={{ width: `${(month.offering / total) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-secondary transition-all"
                        style={{ width: `${(month.building / total) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-warning transition-all"
                        style={{ width: `${(month.welfare / total) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Tithe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Offering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-secondary" />
                <span className="text-xs text-muted-foreground">Building</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-xs text-muted-foreground">Welfare</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
            <CardDescription>Year-to-date breakdown</CardDescription>
          </CardHeader>
          <CardContent>
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
                      <span className="text-sm text-muted-foreground ml-2">({category.percentage}%)</span>
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
              { label: 'Average Monthly Collection', value: 'KES 503,367', change: '+12.5%', positive: true },
              { label: 'Highest Collection Month', value: 'June 2024', subtext: 'KES 563,000' },
              { label: 'Active Contributors', value: '186', change: '+8 this month', positive: true },
              { label: 'Pledge Fulfillment Rate', value: '78.5%', change: '-2.1%', positive: false },
            ].map((metric, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-xl font-bold mt-1">{metric.value}</p>
                {metric.change && (
                  <p className={`text-sm mt-1 ${metric.positive ? 'text-success' : 'text-destructive'}`}>
                    {metric.change}
                  </p>
                )}
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
