import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/fetcher';
import { MapPin, Tag, Clock, ArrowLeft } from 'lucide-react';

export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError(null);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetcher(`${backendUrl}/api/community/${id}`);
        if (res.success && res.event) {
          setEvent(res.event);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  let content = null;
  if (loading) {
    content = <div className="text-center py-8 text-gray-500">Loading event details...</div>;
  } else if (error) {
    content = <div className="text-center py-8 text-red-500">{error}</div>;
  } else if (event) {
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
    content = (
      <Card className="max-w-xl w-full mx-auto p-0 overflow-hidden">
        {imageSrc && (
          <img
            src={imageSrc}
            alt={event.name}
            className="w-full h-64 object-cover rounded-t-xl"
            style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          />
        )}
        <CardContent className="pb-6">
          <div className="font-bold text-2xl mb-2 capitalize">{event.name}</div>
          <div className="flex items-center text-gray-600 text-base mb-2 gap-2">
            <Clock className="size-5 text-gray-400" />
            <span>{dateTimeStr}{timeStr ? ` • ${timeStr}` : ''}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm mb-2 gap-2">
            <MapPin className="size-5 text-gray-400" />
            <span className="capitalize">{event.location || ''}</span>
          </div>
          {event.category && (
            <div className="flex items-center text-gray-500 text-sm mb-2 gap-2">
              <Tag className="size-5 text-gray-400" />
              <span className="capitalize">{event.category}</span>
            </div>
          )}
          {event.description && (
            <div className="mt-4 text-base text-gray-700 whitespace-pre-line">{event.description}</div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start pt-8 pb-24">
      <div className="w-full max-w-xl mx-auto mb-6 flex items-center">
        <Button variant="outline" className="mr-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 size-4" /> Back
        </Button>
        <h2 className="text-2xl font-semibold">Event Details</h2>
      </div>
      {content}
    </div>
  );
} 