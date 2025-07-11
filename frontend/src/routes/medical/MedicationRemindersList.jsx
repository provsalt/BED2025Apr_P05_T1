import React, { useEffect, useState, useContext } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserContext } from '@/provider/UserContext.js';
import { useNavigate } from 'react-router';
import { fetcher } from '@/lib/fetcher.js';




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

  useEffect(() => {
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
    fetchReminders();
  }, [userContext?.id, userContext?.token]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Medication Reminders</h2>
        <Button variant="default" className="bg-blue-500 hover:bg-blue-600 cursor-pointer" onClick={() => navigate('/medical/create')}>+ Add New Reminder</Button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No reminders</div>
      ) : (
        <div className="space-y-4">
          {reminders.map(reminder => (
            <Card key={reminder.id} className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <CardContent className="flex-1 w-full">
                <div className="font-bold text-base mb-1">{reminder.medicine_name}</div>
                <div className="text-gray-500 text-sm">
                  {reminder.reason} • {reminder.dosage} • {formatSqlTime(reminder.medicine_time)} • {reminder.frequency_per_day} per day
                </div>
              </CardContent>
              <div className="flex gap-2 px-6 pb-4 md:pb-0">
                <Button variant="secondary" className="bg-yellow-400 hover:bg-yellow-500 text-white cursor-pointer">Edit</Button>
                <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
