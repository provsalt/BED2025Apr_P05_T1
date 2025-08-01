import { useContext } from "react";
import { UserContext } from "@/provider/UserContext";
import AnnouncementsList from "@/components/announcements/AnnouncementsList.jsx";
import { Dashboard } from "@/components/home/Dashboard";
import { Landing } from "@/components/home/Landing";
import { Button } from "@/components/ui/button.jsx";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardSkeleton } from "@/components/home/Dashboard";

export const Home = () => {
  const { isAuthenticated, isLoading: authLoading, id: userId } = useContext(UserContext);
  const { summary, loading, error, fetchDashboardData } = useDashboardData(isAuthenticated && !authLoading);

  // Show loading while authentication is being determined
  if (authLoading) {
    return (
      <div className="flex-1 bg-gray-50 text-gray-900">
        <div className="mx-auto px-6 py-12">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        // Use public endpoint for everyone
        const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/announcements`;
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to load announcements: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error loading announcements:', error);
        setAnnouncements([]);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

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
    <div className="flex-1 bg-background text-foreground">
      <div className="mx-auto px-6 py-12">
        <AnnouncementsList isAdmin={false} />
        <div className="mb-4 flex justify-end">
          {isAuthenticated && (
            <Button onClick={fetchDashboardData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>
        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}
        {isAuthenticated ? (
          loading ? <DashboardSkeleton /> : <Dashboard key={userId} summary={summary} />
        ) : (
          <Landing />
        )}
      </div>
    </div>
  );
};
