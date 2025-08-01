import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/provider/UserContext";
import { fetcher } from "@/lib/fetcher";
import AnnouncementsList from "@/components/announcements/AnnouncementsList.jsx";
import { Dashboard } from "@/components/home/Dashboard";
import { Landing } from "@/components/home/Landing";

export const Home = () => {
  const { isAuthenticated } = useContext(UserContext);
  const [summary, setSummary] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetcher("/api/user/summary")
        .then((data) => setSummary(data))
        .catch((err) => console.error("Failed to load summary", err));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        let endpoint;
        
        if (isAuthenticated) {
          // Use user-specific endpoint for authenticated users
          endpoint = "/announcements/user";
          const data = await fetcher(endpoint);
          setAnnouncements(data);
        } else {
          // Use public endpoint for non-authenticated users
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/announcements`;
          const response = await fetch(endpoint);
          
          if (!response.ok) {
            throw new Error(`Failed to load announcements: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('Error loading announcements:', error);
        setAnnouncements([]);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    loadAnnouncements();
  }, [isAuthenticated]);

  const handleDismissAnnouncement = async (announcementId) => {
    try {
      await fetcher(`/announcements/${announcementId}/dismiss`, {
        method: 'POST'
      });
      
      // Remove the dismissed announcement from the local state
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== announcementId));
    } catch (error) {
      console.error('Error dismissing announcement:', error);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 text-gray-900">
      <div className="mx-auto px-6 py-12">
        {!announcementsLoading && announcements.length > 0 && (
          <AnnouncementsList
            isAdmin={false}
            onDismiss={isAuthenticated ? handleDismissAnnouncement : undefined}
          />
        )}
        {isAuthenticated ? <Dashboard summary={summary} /> : <Landing />}
      </div>
    </div>
  );
};
