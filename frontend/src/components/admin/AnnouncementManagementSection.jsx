import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component in shadcn/ui
import AnnouncementsList from '@/components/announcements/AnnouncementsList.jsx';

const AnnouncementManagementSection = ({
  announcementTitle,
  setAnnouncementTitle,
  announcementContent,
  setAnnouncementContent,
  handleCreateAnnouncement,
  announcementsKey,
  handleDeleteAnnouncement,
  backendUrl
}) => (
  <div className="bg-white rounded-lg shadow-md border">
    <div className="p-6 border-b">
      <h3 className="text-lg font-semibold">Announcements Management</h3>
      <p className="text-gray-600">Create and manage system announcements</p>
    </div>
    <div className="p-6 space-y-6">
      <form onSubmit={handleCreateAnnouncement} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={announcementTitle}
            onChange={e => setAnnouncementTitle(e.target.value)}
            maxLength={255}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <Textarea
            value={announcementContent}
            onChange={e => setAnnouncementContent(e.target.value)}
            maxLength={5000}
            rows={4}
            required
          />
        </div>
        <Button type="submit">
          Publish Announcement
        </Button>
      </form>
      <AnnouncementsList
        key={announcementsKey}
        isAdmin={true}
        onDelete={handleDeleteAnnouncement}
        adminApiEndpoint={`${backendUrl}/api/announcements`}
      />
    </div>
  </div>
);

export default AnnouncementManagementSection;
