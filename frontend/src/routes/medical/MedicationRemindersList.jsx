import React, { useEffect, useState, useContext } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserContext } from '@/provider/UserContext.js';
import { useNavigate } from 'react-router';
import { fetcher } from '@/lib/fetcher.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';




function formatSqlTime(sqlTime) {
  if (!sqlTime) return '';
  // Handles both '19:23:00.0000000' and '1970-01-01T19:23:00.000Z'
  const match = sqlTime.match(/(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  return sqlTime;
}

export const MedicationRemindersList = () => {
  const userContext = useContext(UserContext);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });
  const [deletingId, setDeletingId] = useState(null);

  const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const data = await fetcher(`${backendUrl}/api/medications`);
      if (data.success) {
        setReminders(data.reminders);
      } else {
        setReminders([]);
      }
    } catch (err) {
      setError('Failed to load reminders');
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [userContext?.id, userContext?.token]);

  const handleDelete = async (reminderId) => {
    setDeletingId(reminderId);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await fetcher(`${backendUrl}/api/medications/${reminderId}`, {
        method: 'DELETE',
      });
      setDialog({ open: true, type: 'success', message: 'Medication reminder deleted successfully!' });
      await fetchReminders();
    } catch (error) {
      console.log('Delete error:', error);
      let errorMsg = error.message || '';
      if (errorMsg.includes('not found') || errorMsg.includes('not authorized')) {
        setDialog({ open: true, type: 'error', message: 'Reminder not found or you are not authorized to delete it.' });
      } else {
        setDialog({ open: true, type: 'error', message: 'Network error. Please try again.' });
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Medication Reminders</h2>
        <Button variant="default" className="bg-primary hover:bg-primary/90 cursor-pointer" onClick={() => navigate('/medical/create')}>+ Add New Reminder</Button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">{error}</div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No reminders</div>
      ) : (
        <div className="space-y-4">
          {reminders.map(reminder => (
            <Card key={reminder.id} className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <CardContent className="flex-1 w-full">
                <div className="font-bold text-base mb-1">{reminder.medicine_name}</div>
                <div className="text-muted-foreground text-sm">
                  {reminder.reason} • {reminder.dosage} • {formatSqlTime(reminder.medicine_time)} • {reminder.frequency_per_day} per day
                </div>
              </CardContent>
              <div className="flex gap-2 px-6 pb-4 md:pb-0">
                <Button variant="secondary" className="cursor-pointer" onClick={() => navigate(`/medical/edit/${reminder.id}`)}>Edit</Button>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  disabled={deletingId === reminder.id}
                  onClick={() => handleDelete(reminder.id)}
                >
                  {(() => { if (deletingId === reminder.id) { return 'Deleting...'; } else { return 'Delete'; } })()}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={dialog.type === 'error' ? 'text-destructive' : 'text-primary'}>
              {(() => { if (dialog.type === 'error') { return 'Error'; } else { return 'Success'; } })()}
            </DialogTitle>
            <DialogDescription>{dialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="cursor-pointer" onClick={() => {
              setDialog(d => ({ ...d, open: false }));
              //window.location.reload();
            }}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
