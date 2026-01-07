import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import { X } from 'lucide-react';

const AnnouncementsList = ({ 
  isAdmin = false, 
  onDelete, 
  onDismiss, 
  announcements = [], 
  loading = false, 
  error = null 
}) => {
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
