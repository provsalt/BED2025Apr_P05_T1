import React, { useEffect, useState } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { fetcher } from '@/lib/fetcher';

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

  let content = null;
  if (loading) {
    content = <div className="text-center py-8 text-gray-500">Loading events...</div>;
  } else if (error) {
    content = <div className="text-center py-8 text-red-500">{error}</div>;
  } else if (events.length === 0) {
    content = <div className="text-center py-8 text-gray-500">No community events available.</div>;
  } else {
    content = (
      <div className="flex flex-wrap gap-6">
        {events.map(event => {
          let imageSrc = '';
          if (event.image_url) {
            if (event.image_url.startsWith('http')) {
              imageSrc = event.image_url;
            } else {
              imageSrc = `${import.meta.env.VITE_BACKEND_URL}${event.image_url}`;
            }
          }
          // Date/time formatting logic
          let dateTimeStr = '';
          if (event.date) {
            dateTimeStr = new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
          }
          if (event.time) {
            // Parse ISO string and extract HH:MM
            const d = new Date(event.time);
            const hours = d.getUTCHours().toString().padStart(2, '0');
            const minutes = d.getUTCMinutes().toString().padStart(2, '0');
            dateTimeStr += ' • ' + hours + ':' + minutes;
          }

          return (
            <Card key={event.id} className="w-64 p-0 overflow-hidden flex-shrink-0">
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt={event.name}
                  className="w-full h-40 object-cover rounded-t-xl"
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                />
              )}
              <CardContent className="pb-6">
                <div className="font-semibold text-base mb-1 truncate" title={event.name}>{event.name}</div>
                <div className="text-gray-600 text-sm mb-1">{dateTimeStr}</div>
                <div className="text-gray-500 text-xs mb-1">
                  {event.location || ''}{event.category ? ` • ${event.category}` : ''}
                </div>
                <div className="text-gray-500 text-xs mb-1 truncate" title={event.description}>{event.description}</div>
                {event.created_by_name && (
                  <div className="text-gray-400 text-xs mt-2 mb-4">By {event.created_by_name}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Community Events</h2>
        <Button className="bg-black text-white hover:bg-gray-900 cursor-pointer" onClick={() => navigate('/community/create')}>
          Add New Event
        </Button>
      </div>
      {content}
    </div>
  );
}
