import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Calendar, Tag } from "lucide-react";
import { fetcher } from "@/lib/fetcher";

export function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  let imageSrc = event.image_url;
  if (imageSrc && !imageSrc.startsWith("http")) {
    imageSrc = `${import.meta.env.VITE_BACKEND_URL}${imageSrc}`;
  }

  //format date and time
  let dateStr = event.date ? new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "";
  let timeStr = "";
  if (event.time) {
    const match = event.time.match(/T(\d{2}:\d{2}:\d{2})/);
    if (match) timeStr = match[1].slice(0, 5);
  }

  // Organizer info (placeholder avatar)
  const organizerName = event.created_by_name || "Event Organizer";
  let organizerAvatar;
  if (event.created_by_profile_picture) {
    organizerAvatar = event.created_by_profile_picture;
  } else {
    organizerAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(organizerName)}&background=E5E7EB&color=374151&size=64`;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 px-2 md:px-0 pb-7">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="cursor-pointer hover:underline" onClick={() => navigate('/community')}>Events</span>
        <span>/</span>
        <span>Community Event</span>
      </div>
      <h1 className="text-3xl font-bold mb-4 capitalize">{event.name}</h1>
      {imageSrc && (
        <img src={imageSrc} alt={event.name} className="w-full max-h-screen object-contain rounded-xl mb-6 bg-white" />
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
            <div className="text-xs text-gray-400 mb-1">Organizer</div>
            <div className="flex items-center gap-2 capitalize"><User className="size-4 text-gray-400" />{organizerName}</div>
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
        <img src={organizerAvatar} alt={organizerName} className="w-12 h-12 rounded-full border" />
        <div className="flex-1">
          <div className="font-semibold text-gray-800 capitalize">{organizerName}</div>
          <div className="text-xs text-gray-500">Event Organizer</div>
        </div>
        <Button className="h-10 px-6 cursor-pointer">Send Message</Button>
      </div>
      <div className="w-full max-w-3xl mx-auto">
        <Button className="h-10 w-full cursor-pointer font-semibold">Sign Up for Event</Button>
      </div>
    </div>
    
  );
} 