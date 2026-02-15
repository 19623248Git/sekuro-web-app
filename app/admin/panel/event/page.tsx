'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

type Event = {
  id: number;
  created_at: string;
  event_title: string;
  event_start: string;
  event_location: string;
  event_status: 'UPCOMING' | 'COMING_SOON' | 'ONGOING' | 'OVER';
};

const EVENT_STATUS_OPTIONS = ['UPCOMING', 'COMING_SOON', 'ONGOING', 'OVER'] as const;

type EventFormData = {
  event_title: string;
  event_start: string;
  event_location: string;
  event_status: 'UPCOMING' | 'COMING_SOON' | 'ONGOING' | 'OVER';
};

export default function EventManagementPanel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<EventFormData>({
    event_title: '',
    event_start: '',
    event_location: '',
    event_status: 'UPCOMING'
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch all events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/api/event/list-event');
      const result = await response.json();
      
      if (result.data) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new event
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/admin/api/event/add-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Event added successfully!');
        setFormData({
          event_title: '',
          event_start: '',
          event_location: '',
          event_status: 'UPCOMING'
        });
        setDialogOpen(false);
        fetchEvents();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit event
  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setSubmitting(true);

    try {
      const response = await fetch('/admin/api/event/edit-event', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId,
          ...formData
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Event updated successfully!');
        setFormData({
          event_title: '',
          event_start: '',
          event_location: '',
          event_status: 'UPCOMING'
        });
        setEditingId(null);
        setDialogOpen(false);
        fetchEvents();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/admin/api/event/delete-event?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        alert('Event deleted successfully!');
        fetchEvents();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  // Load event data into form for editing
  const handleStartEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData({
      event_title: event.event_title,
      event_start: event.event_start,
      event_location: event.event_location,
      event_status: event.event_status
    });
    setDialogOpen(true);
  };
  
  // Open dialog for creating new event
  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      event_title: '',
      event_start: '',
      event_location: '',
      event_status: 'UPCOMING'
    });
    setDialogOpen(true);
  };

  // Filter and pagination logic
  const filteredEvents = statusFilter === 'ALL' 
    ? events 
    : events.filter(event => event.event_status === statusFilter);
  
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Event Management Panel</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew}>+ Event</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the event details below' : 'Fill in the details to create a new event'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editingId ? handleEditEvent : handleAddEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event_title">Event Title</Label>
                <Input
                  id="event_title"
                  name="event_title"
                  value={formData.event_title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_start">Event Start Date</Label>
                <Input
                  id="event_start"
                  name="event_start"
                  type="datetime-local"
                  value={formData.event_start}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_location">Event Location</Label>
                <Input
                  id="event_location"
                  name="event_location"
                  value={formData.event_location}
                  onChange={handleInputChange}
                  placeholder="Enter event location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_status">Event Status</Label>
                <select
                  id="event_status"
                  name="event_status"
                  value={formData.event_status}
                  onChange={handleInputChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  required
                >
                  {EVENT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Processing...' : editingId ? 'Update Event' : 'Create Event'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-4 mb-4">
        <Label htmlFor="status-filter" className="font-semibold">Filter by Status:</Label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          <option value="ALL">All Statuses</option>
          {EVENT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Events Table */}
      <div className="rounded-md border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {statusFilter === 'ALL' ? 'No events found. Create your first event!' : `No events with status "${statusFilter}" found.`}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center"><strong>Event Title</strong></TableHead>
                  <TableHead className="text-center"><strong>Start Date</strong></TableHead>
                  <TableHead className="text-center"><strong>Location</strong></TableHead>
                  <TableHead className="text-center"><strong>Status</strong></TableHead>
                  <TableHead className="text-center"><strong>Actions</strong></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium text-center">{event.event_title}</TableCell>
                    <TableCell className="text-center">{new Date(event.event_start).toLocaleString()}</TableCell>
                    <TableCell className="text-center">{event.event_location}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={
                          event.event_status === 'UPCOMING' || event.event_status === 'COMING_SOON' 
                            ? 'default' 
                            : event.event_status === 'ONGOING' 
                            ? 'outline' 
                            : 'secondary'
                        }
                      >
                        {event.event_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStartEdit(event)}>
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
