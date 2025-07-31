import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { 
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Check, X, Eye } from "lucide-react";
import { fetcher } from '@/lib/fetcher';

const CommunityEventApprovalSection = ({ backendUrl, alert }) => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const response = await fetcher(`${backendUrl}/api/community/pending`);
      if (response.success) {
        setPendingEvents(response.events);
      } else {
        alert.error({ title: "Error", description: response.message });
      }
    } catch (error) {
      alert.error({ title: "Error", description: `Failed to fetch pending events: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (eventId) => {
    try {
      const response = await fetcher(`${backendUrl}/api/community/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId })
      });

      if (response.success) {
        alert.success({ title: "Success", description: "Event approved successfully" });
        fetchPendingEvents(); // Refresh the list
      } else {
        alert.error({ title: "Error", description: response.message });
      }
    } catch (error) {
      alert.error({ title: "Error", description: `Failed to approve event: ${error.message}` });
    }
  };

  const rejectEvent = async (eventId) => {
    try {
      const response = await fetcher(`${backendUrl}/api/community/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId })
      });

      if (response.success) {
        alert.success({ title: "Success", description: "Event rejected successfully" });
        fetchPendingEvents(); // Refresh the list
      } else {
        alert.error({ title: "Error", description: response.message });
      }
    } catch (error) {
      alert.error({ title: "Error", description: `Failed to reject event: ${error.message}` });
    }
  };

  const viewEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Handle both time formats (HH:mm:ss and HH:mm)
    const time = timeString.split('T')[1] || timeString;
    return time.substring(0, 5); // Show only HH:mm
  };

  const getCategoryColor = (category) => {
    const colors = {
      sports: 'bg-primary/10 text-primary hover:bg-primary/20',
      arts: 'bg-primary/10 text-primary hover:bg-primary/20',
      culinary: 'bg-primary/10 text-primary hover:bg-primary/20',
      learn: 'bg-primary/10 text-primary hover:bg-primary/20'
    };
    return colors[category] || 'bg-muted text-muted-foreground hover:bg-muted/80';
  };

  if (loading) {
    return (
      <div className="bg-background rounded-lg shadow-md border p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading pending events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg shadow-md border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Community Event Approvals</h3>
        <p className="text-muted-foreground">Review and approve pending community events</p>
      </div>
      
      <div className="p-6">
        {pendingEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No pending events to approve.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium">
                Pending Events ({pendingEvents.length})
              </h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchPendingEvents}
                className="cursor-pointer"
              >
                Refresh
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{event.created_by_name}</TableCell>
                    <TableCell>
                      <Chip className={getCategoryColor(event.category)}>
                        {event.category.toUpperCase()}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(event.date)}</div>
                        <div className="text-muted-foreground">{formatTime(event.time)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewEventDetails(event)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 cursor-pointer">
                              <Check className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve "{event.name}"? This event will become visible to all users.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => approveEvent(event.id)}
                                className="bg-primary hover:bg-primary/90 cursor-pointer"
                              >
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="cursor-pointer">
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject "{event.name}"? This action cannot be undone and the event will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => rejectEvent(event.id)}
                                className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                              >
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      {/* Event Details */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{selectedEvent.name}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEventDetails(false)}
                className="cursor-pointer"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organizer</label>
                  <p>{selectedEvent.created_by_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <Chip className={getCategoryColor(selectedEvent.category)}>
                    {selectedEvent.category.toUpperCase()}
                  </Chip>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p>{formatDate(selectedEvent.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Time</label>
                  <p>{formatTime(selectedEvent.time)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p>{selectedEvent.location}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-foreground whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
              
              {selectedEvent.image_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cover Image</label>
                  <div className="mt-2">
                    <img 
                      src={`${backendUrl}${selectedEvent.image_url}`} 
                      alt="Event cover" 
                      className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEventDetails(false)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" className="bg-primary hover:bg-primary/90 cursor-pointer">
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve "{selectedEvent.name}"? This event will become visible to all users.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          approveEvent(selectedEvent.id);
                          setShowEventDetails(false);
                        }}
                        className="bg-primary hover:bg-primary/90 cursor-pointer"
                      >
                        Approve
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="cursor-pointer">
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject "{selectedEvent.name}"? This action cannot be undone and the event will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          rejectEvent(selectedEvent.id);
                          setShowEventDetails(false);
                        }}
                        className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityEventApprovalSection; 