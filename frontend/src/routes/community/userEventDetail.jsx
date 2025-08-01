import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Calendar, Tag, ChevronLeft, ChevronRight, ArrowLeft, AlertCircle, CheckCircle, CalendarX } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserContext } from "@/provider/UserContext.js";
import { decodeJwt } from "jose";

export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userContext = React.useContext(UserContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });
  const [unauthorizedDialog, setUnauthorizedDialog] = useState({ open: false });
  const [unauthorizedDeleteDialog, setUnauthorizedDeleteDialog] = useState({ open: false });

  // Check authentication status with better error handling
  const localStorageToken = localStorage.getItem('token');
  const hasToken = localStorageToken || userContext.token;
  const isAuthenticated = (userContext.isAuthenticated && userContext.id) || hasToken;

  // Extract user ID from JWT token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = decodeJwt(token);
        return decoded.sub;
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }
    return null;
  };

  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError(null);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetcher(`${backendUrl}/api/community/${id}`);
        if (res.success) {
          setEvent(res.event);
          
          // Check if user owns this event
          if (isAuthenticated && currentUserId && res.event.user_id !== currentUserId) {
            setUnauthorizedDialog({ open: true });
            return;
          }
        } else {
          setError("Event not found");
        }
      } catch (err) {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id, isAuthenticated, currentUserId]);

  // Show loading state while user context is initializing
  if (userContext?.isLoading) {
    return (
      <div className="w-full p-6 bg-muted min-h-screen">
        <div className="bg-background rounded-lg shadow-sm border p-6 max-w-md mx-auto">
          <div className="text-center py-8 text-muted-foreground">
            Loading user authentication...
          </div>
        </div>
      </div>
    );
  }

  // Check if user context exists and is properly loaded
  if (!userContext) {
    return (
      <div className="w-full p-6 bg-muted min-h-screen">
        <div className="bg-background rounded-lg shadow-sm border p-6 max-w-md mx-auto">
          <div className="text-center py-8 text-muted-foreground">
            Loading user authentication...
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading event...</div>;
  if (error) return <div className="text-center py-8 text-destructive">{error}</div>;
  if (!event) return null;

  const images = (() => {
    if (Array.isArray(event.images)) {
      return event.images;
    }
    return [];
  })();
  const hasImages = images.length > 0;
  let imageSrc;
  if (hasImages) {
    imageSrc = images[currentImage] && images[currentImage].image_url;
  } else {
    imageSrc = event.image_url;
  }
  if (imageSrc && !imageSrc.startsWith("http")) {
    if (imageSrc.startsWith('/api/s3')) {
      // Handle relative S3 URLs
      imageSrc = `${import.meta.env.VITE_BACKEND_URL}${imageSrc}`;
    } else {
      // Fallback for other relative URLs
      imageSrc = `${import.meta.env.VITE_BACKEND_URL}/${imageSrc}`;
    }
  }

  const dateStr = (() => {
    if (event.date) {
      return new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return "";
  })();
  const timeStr = (() => {
    if (event.time) {
      const match = event.time.match(/T(\d{2}:\d{2}:\d{2})/);
      if (match) {
        return match[1].slice(0, 5);
      }
    }
    return "";
  })();

  const organizerName = (() => {
    if (event.created_by_name) {
      return event.created_by_name;
    }
    return "Event Organizer";
  })();

  //carousel navigation
  const goLeft = () => {
    if (images.length > 0) {
      setCurrentImage((prev) => {
        if (prev === 0) {
          return images.length - 1;
        }
        return prev - 1;
      });
    }
  };
  const goRight = () => {
    if (images.length > 0) {
      setCurrentImage((prev) => {
        if (prev === images.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }
  };

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      const result = await fetcher(`/community/${id}`, {
        method: 'DELETE',
      });

      if (result.success) {
        setDialog({ open: true, type: 'success', message: 'Event deleted successfully!' });
      } else {
        setDialog({ open: true, type: 'error', message: result.message || 'Failed to delete event' });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setDialog({ open: true, type: 'error', message: 'Failed to delete event. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 px-2 md:px-0 pb-7">
      <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground cursor-pointer -ml-2">
        <Button variant="ghost" className="p-0 h-auto cursor-pointer" onClick={() => navigate('/community/myevents')}>
          <ArrowLeft className="mr-2 size-4" />
          My Events
        </Button>
        <span>/</span>
        <span>Event Details</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold capitalize">{event.name}</h1>
        <div className="flex gap-2 items-center">
          {(() => {
            if (event.approved_by_admin_id) {
              return (
                <div className="flex items-center text-green-600 gap-2 px-3 py-1.5 bg-green-50 rounded-lg h-8">
                  <CheckCircle className="size-4" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
              );
            }
            return (
              <div className="flex items-center text-orange-600 gap-2 px-3 py-1.5 bg-orange-50 rounded-lg h-8">
                <AlertCircle className="size-4" />
                <span className="text-sm font-medium">Pending Approval</span>
              </div>
            );
          })()}
          {/* Event Status - Past Event */}
          {(() => {
            const now = new Date();
            let eventDateTime = null;
            if (event.date) {
              const datePart = event.date.split('T')[0];
              let timePart = '23:59:59';
              if (event.time) {
                const match = event.time.match(/T(\d{2}:\d{2}:\d{2})/);
                if (match) {
                  timePart = match[1];
                }
              }
              const eventDateTimeStr = `${datePart}T${timePart}`;
              eventDateTime = new Date(eventDateTimeStr);
            }
            if (eventDateTime && eventDateTime < now) {
              return (
                <div className="flex items-center text-red-600 gap-2 px-3 py-1.5 bg-red-100 rounded-lg h-8 whitespace-nowrap">
                  <CalendarX className="size-4" />
                  <span className="text-sm font-medium">Event Ended</span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Image Carousel */}
      {hasImages && (
        <div className="relative flex items-center justify-center mb-6 mx-auto rounded-xl shadow-md aspect-[4/3] max-w-3xl w-full bg-muted overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none z-10">
            {images.length > 1 && (
              <Button
                variant="outline"
                className="rounded-full p-0 w-8 h-8 flex items-center justify-center shadow bg-background/70 hover:bg-background/90 pointer-events-auto border border-border cursor-pointer"
                onClick={goLeft}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </Button>
            )}
            {images.length > 1 && (
              <Button
                variant="outline"
                className="rounded-full p-0 w-8 h-8 flex items-center justify-center shadow bg-background/70 hover:bg-background/90 pointer-events-auto border border-border cursor-pointer"
                onClick={goRight}
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </Button>
            )}
          </div>
          <img
            src={imageSrc}
            alt={event.name}
            className="object-contain w-full h-full"
          />
        </div>
      )}

      {/* Event Details Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Event Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-foreground text-sm border-b pb-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Date</div>
            <div className="flex items-center gap-2"><Calendar className="size-4 text-muted-foreground" />{dateStr}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Time</div>
            <div className="flex items-center gap-2"><Clock className="size-4 text-muted-foreground" />{timeStr}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Location</div>
            <div className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" /><span className="capitalize">{event.location}</span></div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Category</div>
            <div className="flex items-center gap-2"><Tag className="size-4 text-muted-foreground" /><span className="capitalize">{event.category}</span></div>
          </div>
        </div>
      </div>

      {/* Description */}
      <h2 className="text-lg font-semibold mb-2">Description</h2>
      <div className="text-foreground text-base mb-8 whitespace-pre-line">
        {event.description}
      </div>

      {/* Organizer Section */}
      <div className="flex items-center gap-4 border-t pt-6 mb-8">
        <User className="w-12 h-12 text-muted-foreground" />
        <div className="flex-1">
          <div className="font-semibold text-foreground capitalize">{organizerName}</div>
          <div className="text-xs text-muted-foreground">Event Organizer</div>
        </div>
        <div className="flex gap-2">
          {(() => {
            if (currentUserId && event && event.user_id && currentUserId == event.user_id) {
              return (
                <>
                  <Button className="h-10 px-6 cursor-pointer" onClick={() => navigate(`/community/event/${id}/edit`)}>Edit Event</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="h-10 px-6 cursor-pointer"
                        disabled={deleting}
                      >
                        {(() => {
                          if (deleting) {
                            return 'Deleting...';
                          }
                          return 'Delete Event';
                        })()}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl max-w-md mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this event? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                          <Button className="cursor-pointer" variant="outline">Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button className="cursor-pointer" variant="destructive" onClick={handleDeleteEvent}>Delete Event</Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className={(() => {
              if (dialog.type === 'error') {
                return 'text-destructive';
              }
              return 'text-primary';
            })()}>
              {(() => {
                if (dialog.type === 'error') {
                  return 'Error';
                }
                return 'Success';
              })()}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">{dialog.message}</div>
          <DialogFooter>
            <Button className="cursor-pointer" onClick={() => {
              setDialog(d => ({ ...d, open: false }));
              if (dialog.type === 'success') {
                navigate('/community/myevents');
              }
            }}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

             {/* Unauthorized Access Dialog */}
       <Dialog open={unauthorizedDialog.open} onOpenChange={open => {
         if (!open) {
           setUnauthorizedDialog(d => ({ ...d, open: false }));
           navigate('/community');
         } else {
           setUnauthorizedDialog(d => ({ ...d, open }));
         }
       }}>
         <DialogContent className="rounded-xl">
           <DialogHeader>
             <DialogTitle className="text-destructive">Access Denied</DialogTitle>
           </DialogHeader>
           <div className="py-2">You did not create this event. You can only view and edit events that you created.</div>
           <DialogFooter>
             <Button className="cursor-pointer" onClick={() => {
               setUnauthorizedDialog(d => ({ ...d, open: false }));
               navigate('/community');
             }}>Go to Community</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

      {/* Unauthorized Delete Dialog */}
      <Dialog open={unauthorizedDeleteDialog.open} onOpenChange={open => setUnauthorizedDeleteDialog(d => ({ ...d, open }))}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-destructive">Access Denied</DialogTitle>
          </DialogHeader>
          <div className="py-2">You don't have permission to delete this event.</div>
          <DialogFooter>
            <Button className="cursor-pointer" onClick={() => {
              setUnauthorizedDeleteDialog(d => ({ ...d, open: false }));
              navigate('/community/myevents');
            }}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 