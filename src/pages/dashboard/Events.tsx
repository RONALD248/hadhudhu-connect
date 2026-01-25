import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, ChurchEvent } from '@/hooks/useEvents';
import { format, isAfter, isBefore, startOfDay, addDays, isWithinInterval } from 'date-fns';

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  
  const { user } = useAuth();
  const { data: events = [], isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const canManageEvents = user?.role === 'super_admin' || user?.role === 'secretary' || user?.role === 'pastor';

  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);

  const upcomingEvents = useMemo(() => 
    events.filter(e => isAfter(new Date(e.event_date), today) || format(new Date(e.event_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')),
    [events, today]
  );

  const thisWeekEvents = useMemo(() => 
    events.filter(e => {
      const eventDate = new Date(e.event_date);
      return isWithinInterval(eventDate, { start: today, end: weekEnd });
    }),
    [events, today, weekEnd]
  );

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return upcomingEvents;
    const query = searchQuery.toLowerCase();
    return upcomingEvents.filter(e => 
      e.title.toLowerCase().includes(query) ||
      e.description?.toLowerCase().includes(query) ||
      e.location?.toLowerCase().includes(query)
    );
  }, [upcomingEvents, searchQuery]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createEvent.mutateAsync({
      title,
      description: description || null,
      event_date: eventDate,
      start_time: startTime || null,
      end_time: endTime || null,
      location: location || null,
    });
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditClick = (event: ChurchEvent) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setEventDate(event.event_date);
    setStartTime(event.start_time || '');
    setEndTime(event.end_time || '');
    setLocation(event.location || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    await updateEvent.mutateAsync({
      id: selectedEvent.id,
      title,
      description: description || null,
      event_date: eventDate,
      start_time: startTime || null,
      end_time: endTime || null,
      location: location || null,
    });
    
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
    resetForm();
  };

  const handleDeleteClick = (event: ChurchEvent) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    await deleteEvent.mutateAsync(selectedEvent.id);
    
    setIsDeleteDialogOpen(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getEventBadge = (eventDate: string) => {
    const date = new Date(eventDate);
    const todayStr = format(today, 'yyyy-MM-dd');
    const eventDateStr = format(date, 'yyyy-MM-dd');
    
    if (eventDateStr === todayStr) {
      return <Badge className="bg-success text-success-foreground">Today</Badge>;
    }
    if (isWithinInterval(date, { start: today, end: weekEnd })) {
      return <Badge variant="secondary">This Week</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  if (isLoading) {
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
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Manage church events and activities</p>
        </div>

        {canManageEvents && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new church event or activity
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEvent} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Youth Sabbath" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Event details..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Main Sanctuary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      id="startTime" 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      id="endTime" 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEvent.isPending}>
                    {createEvent.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Event'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
                <p className="text-2xl font-bold text-primary">{upcomingEvents.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-success">{thisWeekEvents.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-muted-foreground">{events.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardContent className="p-6">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <CalendarDays className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No Events Found' : 'No Upcoming Events'}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {searchQuery 
                  ? 'Try adjusting your search query.'
                  : canManageEvents 
                    ? 'Click "Add Event" to schedule a new church event.'
                    : 'No events are currently scheduled.'}
              </p>
              {canManageEvents && !searchQuery && (
                <Button className="mt-4 gap-2" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add First Event
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <CalendarDays className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{event.title}</h3>
                        {getEventBadge(event.event_date)}
                      </div>
                      {canManageEvents && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(event)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(event)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(event.event_date)}
                      </div>
                      {event.start_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(event.start_time)}
                          {event.end_time && ` - ${formatTime(event.end_time)}`}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the event details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEvent} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Event Title *</Label>
              <Input 
                id="edit-title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Youth Sabbath" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event details..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date *</Label>
                <Input 
                  id="edit-date" 
                  type="date" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input 
                  id="edit-location" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Main Sanctuary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input 
                  id="edit-startTime" 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input 
                  id="edit-endTime" 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateEvent.isPending}>
                {updateEvent.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEvent.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
