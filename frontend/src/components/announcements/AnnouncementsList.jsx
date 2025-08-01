import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import { X } from 'lucide-react';
import { fetcher } from '@/lib/fetcher.js';

const AnnouncementsList = ({ isAdmin = false, onDelete, onDismiss, adminApiEndpoint }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, [adminApiEndpoint, isAdmin]); // Add dependencies to reload when props change

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = adminApiEndpoint || `${import.meta.env.VITE_BACKEND_URL}/api/announcements`;

      let data;
      if (isAdmin && adminApiEndpoint) {
        // For admin endpoints, use fetcher with auth
        console.log('Using fetcher with auth for admin endpoint');
        data = await fetcher(adminApiEndpoint);
      } else {
        // For public endpoints, use plain fetch without auth
        console.log('Using plain fetch for public endpoint');
        const response = await fetch(endpoint);
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          throw new Error(`Failed to load announcements: ${response.status} ${response.statusText}`);
        }
        
        data = await response.json();
      }
      
      console.log('Announcements loaded successfully:', data);
      console.log('Number of announcements:', data.length);
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setError(`Failed to load announcements: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (announcementId) => {
    if (onDismiss) {
      await onDismiss(announcementId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <Alert variant="destructive">
          <div>{error}</div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Announcements</h2>
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center">No announcements available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    <div className="text-sm text-gray-500">
                      By {announcement.author_name} • {new Date(announcement.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {onDismiss && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(announcement.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Dismiss announcement"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {isAdmin && (
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        onClick={() => onDelete && onDelete(announcement.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsList;
