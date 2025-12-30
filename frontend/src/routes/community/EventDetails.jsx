import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Clock, User, Calendar, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { UserContext } from "@/provider/UserContext.js";
import { PageHeader } from "@/components/ui/page-header";

export function EventDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [messageDialog, setMessageDialog] = useState({ open: false, message: "" });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { id: currentUserId } = useContext(UserContext);
  const [userData, setUserData] = useState(null);

  //checking to see if user came from signed up events page
  const fromSignedUp = location.state?.fromSignedUp || false;
  //chhecking to see if user came from my events page
  const fromMyEvents = location.state?.fromMyEvents || false;

  // Get user data from localStorage as fallback
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserData(payload);
        console.log('JWT Payload:', payload); // Debug log to see the structure
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  // Use currentUserId from context, fallback to userData from localStorage
  const effectiveUserId = currentUserId || userData?.sub || userData?.id;


  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError(null);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetcher(`${backendUrl}/api/community/${id}`);
        if (res.success) {
          setEvent(res.event);
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
  }, [id]);

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
  const organizerAvatar = event.created_by_profile_picture;

  //carousel navigation
  const goLeft = () => {
    if (images.length > 0) {
      setCurrentImage((prev) => {
        if (prev === 0) {
          return images.length - 1;
        } else {
          return prev - 1;
        }
      });
    }
  };
  const goRight = () => {
    if (images.length > 0) {
      setCurrentImage((prev) => {
        if (prev === images.length - 1) {
          return 0;
        } else {
          return prev + 1;
        }
      });
    }
  };

  const handleSignUp = async () => {
    setSignUpLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetcher(`${backendUrl}/api/community/${id}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.success) {
        setDialog({ open: true, type: 'success', message: res.message || "Successfully signed up for the event!" });
      } else {
        setDialog({ open: true, type: 'error', message: res.message || "Unable to sign up for the event" });
      }
    } catch (err) {
      // Parse error message from the thrown error
      let errorMessage = "Failed to sign up for the event. Please try again.";

      try {
        const errorData = JSON.parse(err.message);
        if (errorData.error) {
          const backendMessage = errorData.error;
          if (backendMessage === 'User is already signed up for this event') {
            errorMessage = "You have already signed up for this event!";
          } else if (backendMessage === 'Event not found') {
            errorMessage = "This event could not be found. It may have been removed.";
          } else if (backendMessage === 'Event is not approved') {
            errorMessage = "This event is not yet approved by an admin";
          } else if (backendMessage === 'Event is in the past or happening now') {
            errorMessage = "This event has already passed";
          } else if (backendMessage === 'You cannot sign up for your own event') {
            errorMessage = "You cannot sign up for your own event";
          } else {
            errorMessage = backendMessage;
          }
        }
      } catch (parseError) {
        // If parsing fails, use the original error message
        errorMessage = err.message || "Failed to sign up for the event. Please try again.";
      }

      setDialog({ open: true, type: 'error', message: errorMessage });
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const result = await fetcher(`${backendUrl}/api/community/${id}`, {
        method: 'DELETE',
      });

      if (result.success) {
        setDialog({ open: true, type: 'success', message: 'Event deleted successfully!' });
        //navigate back to My Events after successful deletion
        setTimeout(() => {
          navigate('/community/myevents');
        }, 1500);
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



  const handleSendMessage = async () => {
    const organiserId = event.user_id;
    if (!organiserId) {
      setDialog({ open: true, type: "error", message: "Organizer ID is missing." });
      return;
    }

    // Open message input dialog
    setMessageDialog({
      open: true,
      message: `Hi`
    });
  };

  const sendChatMessage = async () => {
    const organiserId = event.user_id;
    const userMessage = messageDialog.message;

    if (!userMessage || userMessage.trim() === "") {
      setDialog({ open: true, type: "error", message: "Message cannot be empty." });
      return;
    }

    try {
      const res = await fetcher(`/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: organiserId,
          message: userMessage.trim()
        }),
      });

      if (res.chatId) {
        setMessageDialog({ open: false, message: "" });
        navigate(`/chats/${res.chatId}`);
      }
    } catch (err) {
      setMessageDialog({ open: false, message: "" });
      if (err.status === 409 && err.message) {
        setDialog({ open: true, type: "error", message: "Chat already exists between these users." });
      } else {
        let errorMessage;
        if (err.message) {
          try {
            const parsedError = JSON.parse(err.message);
            errorMessage = parsedError.error || "Failed to create chat";
          } catch {
            errorMessage = err.message || "Failed to create chat";
          }
        } else {
          errorMessage = "Network error. Please try again.";
        }
        setDialog({ open: true, type: "error", message: errorMessage });
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 px-2 md:px-0 pb-7">
      <PageHeader
        breadcrumbs={[
          { label: "Community", href: "/community" },
          { label: event.name },
        ]}
        title={event.name}
      />
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
            <div className="text-xs text-muted-foreground mb-1">Organizer</div>
            <div className="flex items-center gap-2 capitalize"><User className="size-4 text-muted-foreground" />{organizerName}</div>
          </div>
        </div>
      </div>
      {/* Description */}
      <h2 className="text-lg font-semibold mb-2">Description</h2>
      <div className="text-foreground text-base mb-8 whitespace-pre-line">
        {event.description}
      </div>

      {/* Event Status Section - Show for user's own events */}
      {(effectiveUserId && effectiveUserId === event.user_id) && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Event Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Approval Status */}
            <div className="flex items-center gap-2 p-3 rounded-lg border">
              <div className="text-sm font-medium">Approval Status:</div>
              {(() => {
                if (event.approved_by_admin_id) {
                  return (
                    <div className="flex items-center text-green-600 gap-1 px-2 py-1 bg-green-50 rounded-lg">
                      <CheckCircle className="size-4" />
                      <span className="text-sm font-medium">Approved</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center text-orange-600 gap-1 px-2 py-1 bg-orange-50 rounded-lg">
                      <AlertCircle className="size-4" />
                      <span className="text-sm font-medium">Pending Approval</span>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Event Ended Status */}
            <div className="flex items-center gap-2 p-3 rounded-lg border">
              <div className="text-sm font-medium">Event Status:</div>
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
                    <div className="flex items-center text-red-600 gap-1 px-2 py-1 bg-red-50 rounded-lg">
                      <Clock className="size-4" />
                      <span className="text-sm font-medium">Event Ended</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center text-green-600 gap-1 px-2 py-1 bg-green-50 rounded-lg">
                      <Calendar className="size-4" />
                      <span className="text-sm font-medium">Upcoming</span>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
      {/* Organizer Section */}
      <div className="flex items-center gap-4 border-t pt-6 mb-8">
        {(() => {
          if (organizerAvatar) {
            return <img src={organizerAvatar} alt={organizerName} className="w-12 h-12 rounded-full border" />;
          }
          return <User className="w-12" />;
        })()}
        <div className="flex-1">
          <div className="font-semibold text-foreground capitalize">{organizerName}</div>
          <div className="text-xs text-muted-foreground">Event Organizer</div>
        </div>
        <div className="flex gap-2">
          {/* Edit Button - Show if user owns event */}
          {(effectiveUserId && effectiveUserId === event.user_id) && (
            <Button
              className="h-10 px-6 cursor-pointer"
              onClick={() => navigate(`/community/event/${id}/edit`)}
            >
              Edit Event
            </Button>
          )}
          {/* Delete Button - Show only if came from My Events AND user owns event */}
          {fromMyEvents && effectiveUserId && effectiveUserId === event.user_id && (
            <Button
              className="h-10 px-6 cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteEvent}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Event"}
            </Button>
          )}
          {/* Send Message Button - Show if NOT from My Events (user viewing own event) */}
          {!fromMyEvents && (
            <Button
              className="h-10 px-6 cursor-pointer"
              onClick={handleSendMessage}
            >
              Send Message
            </Button>
          )}
        </div>
      </div>
      <div className="w-full max-w-3xl mx-auto">
        {(() => {
          // Hide sign-up button if user came from signed up events page
          if (fromSignedUp) {
            return (
              <div className="text-center py-4 text-green-600 bg-green-50 rounded-lg">
                <p className="text-sm">You are already signed up for this event</p>
              </div>
            );
          }

          if (effectiveUserId && event.user_id && effectiveUserId === event.user_id) {
            return (
              <div className="text-center py-4 text-gray-600 bg-gray-50 rounded-lg">
                <p className="text-sm">You cannot sign up for your own event</p>
              </div>
            );
          } else {
            return (
              <Button
                className="h-10 w-full cursor-pointer font-semibold"
                onClick={handleSignUp}
                disabled={signUpLoading}
              >
                {(() => {
                  let buttonText = "Sign Up for Event";
                  if (signUpLoading) {
                    buttonText = "Signing up...";
                  }
                  return buttonText;
                })()}
              </Button>
            );
          }
        })()}
      </div>

      <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className={dialog.type === 'error' ? 'text-destructive' : 'text-primary'}>
              {dialog.type === 'error' ? 'Error' : 'Success'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">{dialog.message}</div>
          <DialogFooter>
            <Button className="cursor-pointer" onClick={() => setDialog(d => ({ ...d, open: false }))}>
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Input Dialog */}
      <Dialog open={messageDialog.open} onOpenChange={open => setMessageDialog(d => ({ ...d, open }))}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Send Message to {organizerName}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Type your message here..."
              value={messageDialog.message}
              onChange={(e) => setMessageDialog(d => ({ ...d, message: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setMessageDialog({ open: false, message: "" })}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={sendChatMessage}
              className="cursor-pointer"
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success/Error Dialog */}
      <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            {(() => {
              let titleClass = 'text-green-700';
              let titleText = 'Success';

              if (dialog.type === 'error') {
                titleClass = 'text-red-700';
                titleText = 'Error';
              }

              return (
                <DialogTitle className={titleClass}>
                  {titleText}
                </DialogTitle>
              );
            })()}
          </DialogHeader>
          <div className="py-2">{dialog.message}</div>
          <DialogFooter>
            <Button className="cursor-pointer" onClick={() => setDialog(d => ({ ...d, open: false }))}>
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
} 