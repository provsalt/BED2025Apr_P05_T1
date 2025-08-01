import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Calendar, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { UserContext } from '../../provider/UserContext.js';

export function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();
  const userContext = React.useContext(UserContext);

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
          }
          return <User className="w-12" />;
        })()}
        <div className="flex-1">
          <div className="font-semibold text-foreground capitalize">{organizerName}</div>
          <div className="text-xs text-muted-foreground">Event Organizer</div>
        </div>
        <div className="flex gap-2">
          {userContext.id && userContext.id === event.user_id && (
            <Button
              className="h-10 px-6 cursor-pointer"
              onClick={() => navigate(`/community/event/${id}/edit`)}
            >
              Edit Event
            </Button>
          )}
          <Button className="h-10 px-6 cursor-pointer">Send Message</Button>
        </div>
      </div>
      <div className="w-full max-w-3xl mx-auto">
        <Button className="h-10 w-full cursor-pointer font-semibold">Sign Up for Event</Button>
      </div>
    </div>

  );
} 