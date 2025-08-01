import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Clock, User, Calendar, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { UserContext } from "@/provider/UserContext";

export function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });
  const [signUpLoading, setSignUpLoading] = useState(false);
  const navigate = useNavigate();
  const { id: currentUserId } = useContext(UserContext);

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

  //Images array
  let images = [];
  if (Array.isArray(event.images)) {
    images = event.images;
  }
  let hasImages = false;
  if (images.length > 0) {
    hasImages = true;
  }
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

  //format date and time
  let dateStr = "";
  if (event.date) {
    dateStr = new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
  let timeStr = "";
  if (event.time) {
    const match = event.time.match(/T(\d{2}:\d{2}:\d{2})/);
    if (match) {
      timeStr = match[1].slice(0, 5);
    }
  }

  // Organizer info (placeholder avatar)
  let organizerName = "Event Organizer";
  if (event.created_by_name) {
    organizerName = event.created_by_name;
  }
  let organizerAvatar = event.created_by_profile_picture;

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

  

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 px-2 md:px-0 pb-7">
      <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground cursor-pointer -ml-2">
        <Button variant="ghost" className="p-0 h-auto cursor-pointer" onClick={() => navigate('/community')}>
          <ArrowLeft className="mr-2 size-4" />
          Events
        </Button>
        <span>/</span>
        <span>Community Event</span>
      </div>
      <h1 className="text-3xl font-bold mb-4 capitalize">{event.name}</h1>
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
      {/* Organizer Section */}
      <div className="flex items-center gap-4 border-t pt-6 mb-8">
        {(() => {
          if (organizerAvatar) {
            return <img src={organizerAvatar} alt={organizerName} className="w-12 h-12 rounded-full border" />;
          } else {
            return <User className="w-12" />;
          }
        })()}
        <div className="flex-1">
          <div className="font-semibold text-foreground capitalize">{organizerName}</div>
          <div className="text-xs text-muted-foreground">Event Organizer</div>
        </div>
        <Button className="h-10 px-6 cursor-pointer">Send Message</Button>
      </div>
      <div className="w-full max-w-3xl mx-auto">
        {(() => {
          if (currentUserId && event.user_id && currentUserId === event.user_id) {
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