import React, { useEffect, useState } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { fetcher } from '@/lib/fetcher';
import { MapPin, Tag, Clock } from 'lucide-react';

export function CommunityEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetcher(`${backendUrl}/api/community`);
      if (res.success) {
        setEvents(res.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      setError('Failed to load community events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []); 

  //filter out past events
  const getUpcomingEvents = (events) => {
    const now = new Date();
    return events.filter(event => {
      if (!event.date) return false;
      // Extract date (YYYY-MM-DD) from event.date
      const datePart = event.date.split('T')[0];
      let timePart = '23:59:59';
      if (event.time) {
        // Extract time part (HH:mm:ss) from event.time ISO string
        const match = event.time.match(/T(\d{2}:\d{2}:\d{2})/);
        if (match) {
          timePart = match[1];
        }
      }
      // Combine date and time
      const eventDateTimeStr = `${datePart}T${timePart}`;
      const eventDateTime = new Date(eventDateTimeStr);
      return eventDateTime >= now;
    });
  };

  const upcomingEvents = getUpcomingEvents(events);

  let content = null;
  if (loading) {
    content = <div className="text-center py-8 text-gray-500">Loading events...</div>;
  } else if (error) {
    content = <div className="text-center py-8 text-red-500">{error}</div>;
  } else if (upcomingEvents.length === 0) {
    content = <div className="text-center py-8 text-gray-500">No community events available.</div>;
  } else {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {upcomingEvents.map(event => {
          let imageSrc = '';
          if (event.image_url) {
            if (event.image_url.startsWith('http')) {
              imageSrc = event.image_url;
            } else if (event.image_url.startsWith('/api/s3')) {
              // Handle relative S3 URLs
              imageSrc = `${import.meta.env.VITE_BACKEND_URL}${event.image_url}`;
            } else {
              // Fallback for other relative URLs
              imageSrc = `${import.meta.env.VITE_BACKEND_URL}/${event.image_url}`;
            }
          }
          // Date/time formatting logic
          let dateTimeStr = '';
          let timeStr = '';
          if (event.date) {
            dateTimeStr = new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
          }
          if (event.time) {
            // Parse ISO string and extract HH:MM
            const match = event.time.match(/T(\d{2}:\d{2}:\d{2})/);
            if (match) {
              timeStr = match[1].slice(0, 5);
            }
          }

          return (
            <Card key={event.id} className="w-full p-0 overflow-hidden cursor-pointer" onClick={() => navigate(`/community/${event.id}`)}>
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt={event.name}
                  className="w-full h-40 object-cover rounded-t-xl"
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                />
              )}
              <CardContent>
                <div className="font-semibold text-base mb-1 truncate capitalize" title={event.name}>{event.name}</div>
                <div className="flex items-center text-gray-600 text-sm mb-1 gap-2">
                  <Clock className="size-4 text-gray-400" />
                  <span>{dateTimeStr}{(() => {
                    if (timeStr) {
                      return ` • ${timeStr}`;
                    }
                    return '';
                  })()}</span>
                </div>
                <div className="flex items-center text-gray-500 text-xs mb-1 gap-2">
                  <MapPin className="size-4 text-gray-400" />
                  <span className="capitalize">{event.location || ''}</span>
                </div>
                {event.category && (
                  <div className="flex items-center text-gray-500 text-xs mb-1 gap-2">
                    <Tag className="size-4 text-gray-400" />
                    <span className="capitalize">{event.category}</span>
                  </div>
                )}
                {event.created_by_name && (
                  <div className="text-gray-400 text-xs mt-2 mb-4 capitalize">By {event.created_by_name}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pt-8 pb-7">
      <div className="w-full flex flex-col">
        <div className="flex items-center justify-between mb-4 w-full">
          <h2 className="text-xl font-semibold">Community Events</h2>
          <div className="flex gap-2">
            <Button className="bg-black text-white hover:bg-gray-900 cursor-pointer" onClick={() => navigate('/community/myevents')}>
              My Events
            </Button>
            <Button className="bg-black text-white hover:bg-gray-900 cursor-pointer" onClick={() => navigate('/community/create')}>
              Add New Event
            </Button>
          </div>
        </div>
        {content}
      </div>
    </div>
  );
}
