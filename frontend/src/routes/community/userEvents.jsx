import React, { useEffect, useState } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/fetcher';
import { MapPin, Clock, Tag } from 'lucide-react';
import { useNavigate } from 'react-router';

export function UserEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetcher(`${backendUrl}/api/community/myevents`);
      if (res.success) {
        setEvents(res.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      setError('Failed to load your events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserEvents();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto pt-8 pb-7">
      <div className="w-full flex flex-col">
        <div className="flex items-center justify-between mb-4 w-full">
          <h2 className="text-xl font-semibold">My Events</h2>
          <div className="pr-14">
            <Button className="bg-black text-white hover:bg-gray-900 cursor-pointer" onClick={() => navigate('/community/create')}>
              Add New Event
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading your events...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="flex flex-row flex-wrap gap-6">
            {events.map(event => {
              let imageSrc = '';
              if (event.image_url) {
                if (event.image_url.startsWith('http')) {
                  imageSrc = event.image_url;
                } else {
                  imageSrc = `${import.meta.env.VITE_BACKEND_URL}${event.image_url}`;
                }
              }
              let dateTimeStr = '';
              let timeStr = '';
              if (event.date) {
                dateTimeStr = new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
              }
              if (event.time) {
                const match = event.time.match(/T(\d{2}:\d{2}:\d{2})/);
                if (match) {
                  timeStr = match[1].slice(0, 5);
                }
              }
              return (
                <Card
                  key={event.id}
                  className="w-64 p-0 overflow-hidden flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 bg-white"
                  onClick={() => navigate(`/community/event/${event.id}`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${event.name}`}
                >
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt={event.name}
                      className="w-full h-40 object-cover rounded-t-xl"
                      style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    />
                  )}
                  <CardContent className="pb-3">
                    <div className="font-semibold text-base mb-1 truncate capitalize" title={event.name}>{event.name}</div>
                    <div className="flex items-center text-gray-600 text-sm mb-1 gap-2">
                      <Clock className="size-4 text-gray-400" />
                      <span>{dateTimeStr}{timeStr ? ` • ${timeStr}` : ''}</span>
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
