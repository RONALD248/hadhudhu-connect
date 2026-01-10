import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useChurchServices, useAttendanceStats } from '@/hooks/useAttendance';
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface AttendancePatternChartProps {
  weeks?: number;
  title?: string;
  description?: string;
}

export function AttendancePatternChart({ 
  weeks = 8, 
  title = "Attendance Patterns",
  description = "Weekly service attendance"
}: AttendancePatternChartProps) {
  const now = new Date();
  const startDate = format(startOfWeek(subWeeks(now, weeks - 1)), 'yyyy-MM-dd');
  const endDate = format(endOfWeek(now), 'yyyy-MM-dd');

  const { data: services } = useChurchServices(startDate, endDate);

  // Fetch attendance counts for each service
  const { data: attendanceCounts, isLoading } = useQuery({
    queryKey: ['attendance-counts', startDate, endDate],
    queryFn: async () => {
      if (!services || services.length === 0) return {};

      const serviceIds = services.map(s => s.id);
      const { data, error } = await supabase
        .from('attendance_records')
        .select('service_id')
        .in('service_id', serviceIds);

      if (error) throw error;

      // Count attendance per service
      return data.reduce((acc, record) => {
        acc[record.service_id] = (acc[record.service_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    },
    enabled: !!services && services.length > 0,
  });

  const chartData = useMemo(() => {
    if (!services) return [];

    const weeksData = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekDate = subWeeks(now, i);
      const weekStart = startOfWeek(weekDate);
      const weekEnd = endOfWeek(weekDate);

      const weekServices = services.filter(s => {
        const serviceDate = new Date(s.service_date);
        return serviceDate >= weekStart && serviceDate <= weekEnd;
      });

      const totalAttendance = weekServices.reduce((sum, s) => {
        return sum + (attendanceCounts?.[s.id] || 0);
      }, 0);

      weeksData.push({
        week: format(weekStart, 'MMM d'),
        fullWeek: `Week of ${format(weekStart, 'MMM d, yyyy')}`,
        attendance: totalAttendance,
        services: weekServices.length,
      });
    }

    return weeksData;
  }, [services, attendanceCounts, weeks]);

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

  const hasData = chartData.some(d => d.attendance > 0);
  const maxAttendance = Math.max(...chartData.map(d => d.attendance), 1);

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
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-medium">{data.fullWeek}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.attendance} attendees
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.services} services held
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(var(--primary) / ${0.4 + (entry.attendance / maxAttendance) * 0.6})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No attendance data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Charts will appear when attendance is recorded
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}