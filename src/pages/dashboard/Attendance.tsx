import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { Calendar, Users, Plus, Clock, MapPin, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useProfiles";
import { 
  useChurchServices, 
  useCreateService, 
  useDeleteService,
  useAttendanceRecords, 
  useRecordAttendance,
  useRemoveAttendance,
  useAttendanceStats,
  ChurchService 
} from "@/hooks/useAttendance";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  sabbath_school: "Sabbath School",
  divine_service: "Divine Service",
  prayer_meeting: "Prayer Meeting",
  youth_program: "Youth Program",
  midweek_service: "Midweek Service",
  special_event: "Special Event",
  other: "Other",
};

const Attendance = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'super_admin' || user?.role === 'secretary' || user?.role === 'pastor';
  
  const [selectedService, setSelectedService] = useState<ChurchService | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // Date range for filtering
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(today), 'yyyy-MM-dd'),
    end: format(endOfMonth(today), 'yyyy-MM-dd'),
  });
  
  // Form state for new service
  const [newService, setNewService] = useState({
    title: "",
    service_type: "divine_service" as ChurchService['service_type'],
    service_date: format(today, 'yyyy-MM-dd'),
    start_time: "09:00",
    end_time: "12:00",
    description: "",
    location: "Main Sanctuary",
  });
  
  const { data: services = [], isLoading: servicesLoading } = useChurchServices(dateRange.start, dateRange.end);
  const { data: profiles = [] } = useProfiles();
  const { data: attendanceRecords = [] } = useAttendanceRecords(selectedService?.id || "");
  const { data: stats } = useAttendanceStats(dateRange.start, dateRange.end);
  
  const createService = useCreateService();
  const deleteService = useDeleteService();
  const recordAttendance = useRecordAttendance();
  const removeAttendance = useRemoveAttendance();
  
  const handleCreateService = () => {
    createService.mutate({
      ...newService,
      created_by: user?.id || null,
    }, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setNewService({
          title: "",
          service_type: "divine_service",
          service_date: format(today, 'yyyy-MM-dd'),
          start_time: "09:00",
          end_time: "12:00",
          description: "",
          location: "Main Sanctuary",
        });
      },
    });
  };
  
  const handleRecordAttendance = () => {
    if (!selectedService || selectedMembers.length === 0) return;
    
    recordAttendance.mutate({
      serviceId: selectedService.id,
      userIds: selectedMembers,
      checkedInBy: user?.id || "",
    }, {
      onSuccess: () => {
        setSelectedMembers([]);
      },
    });
  };
  
  const filteredProfiles = profiles.filter(profile => {
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
    const membershipNum = profile.membership_number?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || membershipNum.includes(query);
  });
  
  const attendedUserIds = new Set(attendanceRecords.map(r => r.user_id));
  
  const thisWeekStart = format(startOfWeek(today), 'yyyy-MM-dd');
  const thisWeekEnd = format(endOfWeek(today), 'yyyy-MM-dd');
  const thisWeekServices = services.filter(s => s.service_date >= thisWeekStart && s.service_date <= thisWeekEnd);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Tracking</h1>
          <p className="text-muted-foreground">Track church service attendance</p>
        </div>
        {canManage && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Service</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newService.title}
                    onChange={(e) => setNewService(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Sabbath Divine Service"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Service Type</Label>
                  <Select
                    value={newService.service_type}
                    onValueChange={(value) => setNewService(prev => ({ ...prev, service_type: value as ChurchService['service_type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newService.service_date}
                      onChange={(e) => setNewService(prev => ({ ...prev, service_date: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newService.location}
                      onChange={(e) => setNewService(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start">Start Time</Label>
                    <Input
                      id="start"
                      type="time"
                      value={newService.start_time}
                      onChange={(e) => setNewService(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end">End Time</Label>
                    <Input
                      id="end"
                      type="time"
                      value={newService.end_time}
                      onChange={(e) => setNewService(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about the service..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateService} disabled={!newService.title || createService.isPending}>
                  Create Service
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalServices || 0}</div>
            <p className="text-xs text-muted-foreground">Services held</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAttendance || 0}</div>
            <p className="text-xs text-muted-foreground">Check-ins this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageAttendance || 0}</div>
            <p className="text-xs text-muted-foreground">Per service</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekServices.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming services</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {/* Date Range Filter */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="grid gap-2">
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setDateRange({
                    start: format(startOfMonth(today), 'yyyy-MM-dd'),
                    end: format(endOfMonth(today), 'yyyy-MM-dd'),
                  })}
                >
                  This Month
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Services List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servicesLoading ? (
              <p className="text-muted-foreground col-span-full text-center py-8">Loading services...</p>
            ) : services.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No services found for this period</p>
                  {canManage && (
                    <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Service
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              services.map((service) => (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer transition-colors hover:border-primary ${selectedService?.id === service.id ? 'border-primary' : ''}`}
                  onClick={() => {
                    setSelectedService(service);
                    if (canManage) setIsAttendanceDialogOpen(true);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{SERVICE_TYPE_LABELS[service.service_type]}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(service.service_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2">{service.title}</CardTitle>
                    {service.description && (
                      <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {service.start_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{service.start_time} - {service.end_time}</span>
                        </div>
                      )}
                      {service.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{service.location}</span>
                        </div>
                      )}
                    </div>
                    {canManage && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(service);
                          setIsAttendanceDialogOpen(true);
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Attendance
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Service Type</CardTitle>
              <CardDescription>Overview for {format(new Date(dateRange.start), 'MMM d')} - {format(new Date(dateRange.end), 'MMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.byServiceType && Object.keys(stats.byServiceType).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.byServiceType).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{SERVICE_TYPE_LABELS[type] || type}</p>
                        <p className="text-sm text-muted-foreground">{data.count} service(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{data.totalAttendance}</p>
                        <p className="text-sm text-muted-foreground">
                          avg. {data.count > 0 ? Math.round(data.totalAttendance / data.count) : 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No attendance data for this period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attendance Management Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedService?.title}</DialogTitle>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{SERVICE_TYPE_LABELS[selectedService?.service_type || 'other']}</Badge>
              <span>{selectedService && format(new Date(selectedService.service_date), 'MMMM d, yyyy')}</span>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="record" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record">Record Attendance</TabsTrigger>
              <TabsTrigger value="view">View Attendees ({attendanceRecords.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="record" className="space-y-4">
              <div className="space-y-2">
                <Label>Search Members</Label>
                <Input
                  placeholder="Search by name or membership number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <ScrollArea className="h-[300px] border rounded-md p-2">
                {filteredProfiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No members found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredProfiles.map((profile) => {
                      const isAttended = attendedUserIds.has(profile.user_id);
                      const isSelected = selectedMembers.includes(profile.user_id);
                      
                      return (
                        <div
                          key={profile.id}
                          className={`flex items-center gap-3 p-2 rounded-md transition-colors ${isAttended ? 'bg-green-50 dark:bg-green-950/20' : isSelected ? 'bg-primary/10' : 'hover:bg-muted'}`}
                        >
                          <Checkbox
                            checked={isAttended || isSelected}
                            disabled={isAttended}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMembers(prev => [...prev, profile.user_id]);
                              } else {
                                setSelectedMembers(prev => prev.filter(id => id !== profile.user_id));
                              }
                            }}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.photo_url || undefined} />
                            <AvatarFallback>{profile.first_name?.[0]}{profile.last_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{profile.first_name} {profile.last_name}</p>
                            {profile.membership_number && (
                              <p className="text-xs text-muted-foreground">{profile.membership_number}</p>
                            )}
                          </div>
                          {isAttended && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Present
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              
              {selectedMembers.length > 0 && (
                <Button 
                  className="w-full" 
                  onClick={handleRecordAttendance}
                  disabled={recordAttendance.isPending}
                >
                  Record {selectedMembers.length} Attendance(s)
                </Button>
              )}
            </TabsContent>
            
            <TabsContent value="view" className="space-y-4">
              <ScrollArea className="h-[350px]">
                {attendanceRecords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
                ) : (
                  <div className="space-y-2">
                    {attendanceRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={record.profile?.photo_url || undefined} />
                            <AvatarFallback>
                              {record.profile?.first_name?.[0]}{record.profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {record.profile?.first_name} {record.profile?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.profile?.membership_number || 'No membership number'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(record.checked_in_at), 'h:mm a')}
                          </span>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => {
                                if (selectedService) {
                                  removeAttendance.mutate({
                                    serviceId: selectedService.id,
                                    userId: record.user_id,
                                  });
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Attendance;
