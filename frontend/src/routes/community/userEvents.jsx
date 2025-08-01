import React, { useEffect, useState } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/fetcher';
import { MapPin, Clock, Tag, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
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
        
        <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground cursor-pointer -ml-2">
          <Button variant="ghost" className="p-0 h-auto cursor-pointer" onClick={() => navigate('/community')}>
            <ArrowLeft className="mr-2 size-4" />
            Community Events
          </Button>
          <span>/</span>
          <span>My Events</span>
        </div>
        <div className="flex items-center justify-between mb-4 w-full">
          <h2 className="text-xl font-semibold">My Events</h2>
          <div className="pr-14">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" onClick={() => navigate('/community/create')}>
              Add New Event
            </Button>
          </div>
        </div>
        {(() => {
          if (loading) {
            return <div className="text-center py-8 text-muted-foreground">Loading your events...</div>;
          } else if (error) {
            return <div className="text-center py-8 text-destructive">{error}</div>;
          } else {
            return (
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
                      className="w-64 p-0 overflow-hidden flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow border border-border bg-background relative"
                      onClick={() => navigate(`/community/event/${event.id}`)}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${event.name}`}
                    >
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
                      <CardContent className="pb-3">
                        <div className="font-semibold text-base mb-1 truncate capitalize" title={event.name}>{event.name}</div>
                        <div className="flex items-center text-foreground text-sm mb-1 gap-2">
                          <Clock className="size-4 text-muted-foreground" />
                          <span>{dateTimeStr}{(() => {
                            if (timeStr) {
                              return ` • ${timeStr}`;
                            } else {
                              return '';
                            }
                          })()}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground text-xs mb-1 gap-2">
                          <MapPin className="size-4 text-muted-foreground" />
                          <span className="capitalize">{(() => {
                            if (event.location) {
                              return event.location;
                            } else {
                              return '';
                            }
                          })()}</span>
                        </div>
                        {event.category && (
                          <div className="flex items-center text-muted-foreground text-xs mb-1 gap-2">
                            <Tag className="size-4 text-muted-foreground" />
                            <span className="capitalize">{event.category}</span>
                          </div>
                        )}
                        {/* Approval Status */}
                        <div className="flex items-center text-xs mb-1 gap-2">
                          {(() => {
                            if (event.approved_by_admin_id) {
                              return (
                                <div className="flex items-center text-green-600 gap-1 px-2 py-1 bg-green-50 rounded-lg">
                                  <CheckCircle className="size-3" />
                                  <span className="text-xs font-medium">Approved</span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex items-center text-orange-600 gap-1 px-2 py-1 bg-orange-50 rounded-lg">
                                  <AlertCircle className="size-3" />
                                  <span className="text-xs font-medium">Pending Approval</span>
                                </div>
                              );
                            }
                          })()}
                        </div>

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
