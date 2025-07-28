import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Calendar, Tag, ChevronLeft, ChevronRight, ArrowLeft, AlertCircle, CheckCircle, CalendarX } from "lucide-react";
import { fetcher } from "@/lib/fetcher";

export function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

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

  if (loading) return <div className="text-center py-8 text-gray-500">Loading event...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
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

  // Organizer info
  let organizerName = "Event Organizer";
  if (event.created_by_name) {
    organizerName = event.created_by_name;
  }

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
          {/* Delete Button */}
          <Button variant="destructive" size="sm" className="h-8 px-3 cursor-pointer rounded-md">
            Delete Event
          </Button>
          {/* Approval Status */}
          {(() => {
            if (event.approved_by_admin_id) {
              return (
                <div className="flex items-center text-green-600 gap-2 px-3 py-1.5 bg-green-50 rounded-lg h-8">
                  <CheckCircle className="size-4" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
              );
            } else {
              return (
                <div className="flex items-center text-orange-600 gap-2 px-3 py-1.5 bg-orange-50 rounded-lg h-8">
                  <AlertCircle className="size-4" />
                  <span className="text-sm font-medium">Pending Approval</span>
                </div>
              );
            }
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
        <div className="relative flex items-center justify-center mb-6 mx-auto rounded-xl shadow-md aspect-[4/3] max-w-3xl w-full bg-gray-100 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none z-10">
            {images.length > 1 && (
              <Button
                variant="outline"
                className="rounded-full p-0 w-8 h-8 flex items-center justify-center shadow bg-white/70 hover:bg-white/90 pointer-events-auto border border-gray-200 cursor-pointer"
                onClick={goLeft}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </Button>
            )}
            {images.length > 1 && (
              <Button
                variant="outline"
                className="rounded-full p-0 w-8 h-8 flex items-center justify-center shadow bg-white/70 hover:bg-white/90 pointer-events-auto border border-gray-200 cursor-pointer"
                onClick={goRight}
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-gray-700 text-sm border-b pb-4 mb-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Date</div>
            <div className="flex items-center gap-2"><Calendar className="size-4 text-gray-400" />{dateStr}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Time</div>
            <div className="flex items-center gap-2"><Clock className="size-4 text-gray-400" />{timeStr}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Location</div>
            <div className="flex items-center gap-2"><MapPin className="size-4 text-gray-400" /><span className="capitalize">{event.location}</span></div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Category</div>
            <div className="flex items-center gap-2"><Tag className="size-4 text-gray-400" /><span className="capitalize">{event.category}</span></div>
          </div>
        </div>
      </div>
      
      {/* Description */}
      <h2 className="text-lg font-semibold mb-2">Description</h2>
      <div className="text-gray-600 text-base mb-8 whitespace-pre-line">
        {event.description}
      </div>
      
      {/* Organizer Section */}
      <div className="flex items-center gap-4 border-t pt-6 mb-8">
        <User className="w-12 h-12 text-gray-400" />
        <div className="flex-1">
          <div className="font-semibold text-gray-800 capitalize">{organizerName}</div>
          <div className="text-xs text-gray-500">Event Organizer</div>
        </div>
        <Button className="h-10 px-6 cursor-pointer">Edit Event</Button>
      </div>
    </div>
  );
} 