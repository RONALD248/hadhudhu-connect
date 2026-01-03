import { useState, useMemo } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Search, Filter, RefreshCw, Shield, Activity, FileText, Download, FileSpreadsheet, FileDown, CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const actionColors: Record<string, string> = {
  role_assigned: 'bg-green-500/10 text-green-700 border-green-200',
  role_changed: 'bg-blue-500/10 text-blue-700 border-blue-200',
  role_removed: 'bg-red-500/10 text-red-700 border-red-200',
  payment_created: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  payment_modified: 'bg-amber-500/10 text-amber-700 border-amber-200',
  payment_deleted: 'bg-rose-500/10 text-rose-700 border-rose-200',
  profile_updated: 'bg-purple-500/10 text-purple-700 border-purple-200',
};

const entityTypeIcons: Record<string, React.ReactNode> = {
  user_role: <Shield className="h-4 w-4" />,
  payment: <Activity className="h-4 w-4" />,
  profile: <FileText className="h-4 w-4" />,
};

function formatActionLabel(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDetails(details: Record<string, unknown> | null): string {
  if (!details) return '-';
  
  const parts: string[] = [];
  
  if (details.role) parts.push(`Role: ${details.role}`);
  if (details.old_role && details.new_role) {
    parts.push(`${details.old_role} → ${details.new_role}`);
  }
  if (details.amount) parts.push(`Amount: KES ${Number(details.amount).toLocaleString()}`);
  if (details.old_amount && details.new_amount) {
    parts.push(`KES ${Number(details.old_amount).toLocaleString()} → KES ${Number(details.new_amount).toLocaleString()}`);
  }
  if (details.payment_method) parts.push(`Method: ${details.payment_method}`);
  if (details.changes && typeof details.changes === 'object') {
    const changedFields = Object.keys(details.changes as object);
    parts.push(`Changed: ${changedFields.join(', ')}`);
  }
  
  return parts.length > 0 ? parts.join(' | ') : JSON.stringify(details).slice(0, 100);
}

export default function ActivityLogs() {
  const { data: logs, isLoading, refetch, isRefetching } = useActivityLogs();
  const { data: profiles } = useProfiles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const profileMap = useMemo(() => {
    const map = new Map<string, string>();
    profiles?.forEach(p => {
      map.set(p.user_id, `${p.first_name} ${p.last_name}`);
    });
    return map;
  }, [profiles]);

  const uniqueActions = useMemo(() => {
    if (!logs) return [];
    return [...new Set(logs.map(log => log.action))].sort();
  }, [logs]);

  const uniqueEntityTypes = useMemo(() => {
    if (!logs) return [];
    return [...new Set(logs.map(log => log.entity_type))].sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    return logs.filter(log => {
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (entityFilter !== 'all' && log.entity_type !== entityFilter) return false;
      
      // Date range filter
      if (dateRange.from || dateRange.to) {
        if (!log.created_at) return false;
        const logDate = new Date(log.created_at);
        
        if (dateRange.from && dateRange.to) {
          if (!isWithinInterval(logDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) })) {
            return false;
          }
        } else if (dateRange.from) {
          if (logDate < startOfDay(dateRange.from)) return false;
        } else if (dateRange.to) {
          if (logDate > endOfDay(dateRange.to)) return false;
        }
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const userName = log.user_id ? profileMap.get(log.user_id)?.toLowerCase() : '';
        const action = log.action.toLowerCase();
        const entityType = log.entity_type.toLowerCase();
        const details = JSON.stringify(log.details).toLowerCase();
        
        return (
          userName?.includes(query) ||
          action.includes(query) ||
          entityType.includes(query) ||
          details.includes(query)
        );
      }
      
      return true;
    });
  }, [logs, actionFilter, entityFilter, searchQuery, profileMap, dateRange]);

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const stats = useMemo(() => {
    if (!logs) return { total: 0, today: 0, roleChanges: 0, paymentChanges: 0 };
    
    const today = new Date().toDateString();
    const todayLogs = logs.filter(log => 
      log.created_at && new Date(log.created_at).toDateString() === today
    );
    
    return {
      total: logs.length,
      today: todayLogs.length,
      roleChanges: logs.filter(l => l.entity_type === 'user_role').length,
      paymentChanges: logs.filter(l => l.entity_type === 'payment').length,
    };
  }, [logs]);

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Details'];
    const rows = filteredLogs.map(log => [
      log.created_at ? format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss') : '',
      log.user_id ? profileMap.get(log.user_id) || 'Unknown' : 'System',
      formatActionLabel(log.action),
      log.entity_type.replace('_', ' '),
      formatDetails(log.details as Record<string, unknown> | null),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Activity Logs Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 14, 30);
    doc.text(`Total Records: ${filteredLogs.length}`, 14, 36);
    
    const tableData = filteredLogs.map(log => [
      log.created_at ? format(new Date(log.created_at), 'MMM d, HH:mm') : '-',
      log.user_id ? profileMap.get(log.user_id) || 'Unknown' : 'System',
      formatActionLabel(log.action),
      log.entity_type.replace('_', ' '),
      formatDetails(log.details as Record<string, unknown> | null).slice(0, 40),
    ]);

    autoTable(doc, {
      head: [['Timestamp', 'User', 'Action', 'Entity', 'Details']],
      body: tableData,
      startY: 42,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`activity-logs-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-muted-foreground">Monitor all audit logs and system activities</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={filteredLogs.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Logs</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Activity</CardDescription>
            <CardTitle className="text-2xl">{stats.today}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Role Changes</CardDescription>
            <CardTitle className="text-2xl">{stats.roleChanges}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payment Changes</CardDescription>
            <CardTitle className="text-2xl">{stats.paymentChanges}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {formatActionLabel(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {uniqueEntityTypes.map(entity => (
                  <SelectItem key={entity} value={entity}>
                    {entity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !dateRange.from && !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {(dateRange.from || dateRange.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearDateRange}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs?.length || 0} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {log.created_at
                          ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {log.user_id ? profileMap.get(log.user_id) || 'Unknown' : 'System'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={actionColors[log.action] || 'bg-muted'}
                        >
                          {formatActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entityTypeIcons[log.entity_type] || null}
                          <span className="capitalize">
                            {log.entity_type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {formatDetails(log.details as Record<string, unknown> | null)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
