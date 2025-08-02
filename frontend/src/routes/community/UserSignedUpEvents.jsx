import React, { useEffect, useState } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/fetcher';
import { MapPin, Clock, Tag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function UserSignedUpEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSignedUpEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetcher(`${backendUrl}/api/community/signups`);
      if (res.success) {
        setEvents(res.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      setError('Failed to load your signed up events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignedUpEvents();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto pt-8 pb-7">
      <div className="w-full flex flex-col">
        <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground cursor-pointer -ml-2">
          <Button variant="ghost" className="p-0 h-auto cursor-pointer" onClick={() => navigate('/community')}>
            <ArrowLeft className="mr-2 size-4" />
            Community Events
          </Button>
          <span>/</span>
          <span>My Signed Up Events</span>
        </div>
        <div className="flex items-center justify-between mb-4 w-full">
          <h2 className="text-xl font-semibold">My Signed Up Events</h2>
          <div className="flex gap-2">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" onClick={() => navigate('/community/myevents')}>
              My Events
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" onClick={() => navigate('/community/create')}>
              Add New Event
            </Button>
          </div>
        </div>
        {(() => {
          if (loading) {
            return <div className="text-center py-8 text-muted-foreground">Loading your signed up events...</div>;
          } else if (error) {
            return <div className="text-center py-8 text-destructive">{error}</div>;
          } else if (events.length === 0) {
            return <div className="text-center py-8 text-muted-foreground">You haven't signed up for any events yet.</div>;
          } else {
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events
                  .sort((a, b) => {
                    //sort future events first then past events
                    const now = new Date();

                    // Get first event datetime
                    let eventADateTime = null;
                    if (a.date) {
                      const datePart = a.date.split('T')[0];
                      let timePart = '23:59:59';
                      if (a.time) {
                        const match = a.time.match(/T(\d{2}:\d{2}:\d{2})/);
                        if (match) {
                          timePart = match[1];
                        }
                      }
                      const eventADateTimeStr = `${datePart}T${timePart}`;
                      eventADateTime = new Date(eventADateTimeStr);
                    }

                    // Get second event datetime
                    let eventBDateTime = null;
                    if (b.date) {
                      const datePart = b.date.split('T')[0];
                      let timePart = '23:59:59';
                      if (b.time) {
                        const match = b.time.match(/T(\d{2}:\d{2}:\d{2})/);
                        if (match) {
                          timePart = match[1];
                        }
                      }
                      const eventBDateTimeStr = `${datePart}T${timePart}`;
                      eventBDateTime = new Date(eventBDateTimeStr);
                    }

                    // Check if events are in the future or past
                    const aIsFuture = eventADateTime && eventADateTime > now;
                    const bIsFuture = eventBDateTime && eventBDateTime > now;

                    // Sort future events first, then past events
                    if (aIsFuture && !bIsFuture) return -1;
                    if (!aIsFuture && bIsFuture) return 1;

                    // If both are future or both are past, sort by date
                    if (eventADateTime && eventBDateTime) {
                      return eventADateTime - eventBDateTime;
                    }

                    return 0;
                  })
                  .map(event => {
                    let imageSrc = '';
                    if (event.image_url) {
                      if (event.image_url.startsWith('http')) {
                        imageSrc = event.image_url;
                      } else if (event.image_url.startsWith('/api/s3')) {
                        imageSrc = `${import.meta.env.VITE_BACKEND_URL}${event.image_url}`;
                      } else {
                        imageSrc = `${import.meta.env.VITE_BACKEND_URL}/${event.image_url}`;
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
                      <Card key={event.id} className="w-full p-0 overflow-hidden cursor-pointer relative" onClick={() => navigate(`/community/${event.id}`, { state: { fromSignedUp: true } })}>
                        {/* Event Ended Ribbon */}
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
                              <div className="absolute top-13 left-0 z-10">
                                <div className="bg-destructive text-primary-foreground text-xs font-semibold px-5 py-1 transform -rotate-45 origin-bottom-left shadow-md rounded-sm">
                                  Event Ended
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
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
                          <div className="flex items-center text-foreground text-sm mb-1 gap-2">
                            <Clock className="size-4 text-muted-foreground" />
                            <span>{dateTimeStr}{(() => {
                              if (timeStr) {
                                return ` • ${timeStr}`;
                              }
                              return '';
                            })()}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground text-xs mb-1 gap-2">
                            <MapPin className="size-4 text-muted-foreground" />
                            <span className="capitalize">{event.location || ''}</span>
                          </div>
                          {event.category && (
                            <div className="flex items-center text-muted-foreground text-xs mb-1 gap-2">
                              <Tag className="size-4 text-muted-foreground" />
                              <span className="capitalize">{event.category}</span>
                            </div>
                          )}
                          {event.created_by_name && (
                            <div className="text-muted-foreground text-xs mt-2 mb-4 capitalize">By {event.created_by_name}</div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
} 