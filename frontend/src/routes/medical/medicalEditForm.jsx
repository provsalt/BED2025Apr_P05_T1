import React, { useState, useEffect, useContext } from 'react';
import { MedicationReminderForm }  from './MedicationReminderForm.jsx';
import { UserContext } from '@/provider/UserContext.js';
import { fetcher } from '@/lib/fetcher.js';
import { useParams, useNavigate } from 'react-router';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

//limit frequency per reminder
const MAX_FREQUENCY_PER_REMINDER = 3;

export function MedicationEditForm() {
  const user = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch existing reminder data
    const fetchReminder = async () => {
      setLoading(true);
      try {
        const data = await fetcher(`${backendUrl}/api/medications`);
        if (data.success && data.reminders) {
          const reminder = data.reminders.find(r => String(r.id) === String(id));
          if (reminder) {
            setFormData({
              medicationName: reminder.medicine_name,
              reason: reminder.reason,
              dosage: reminder.dosage,
              medicineTime: reminder.medicine_time?.slice(0,5) || '',
              frequencyPerDay: reminder.frequency_per_day,
              imageFile: null,
              imagePreview: null,
              oldImageUrl: reminder.image_url
            });
          } else {
            setDialog({ open: true, type: 'error', message: 'Reminder not found.' });
          }
        } else {
          setDialog({ open: true, type: 'error', message: 'Failed to fetch reminder.' });
        }
      } catch (err) {
        setDialog({ open: true, type: 'error', message: 'Network error.' });
      } finally {
        setLoading(false);
      }
    };
    fetchReminder();
  }, [id]);

  const handleEdit = async (formData, _setFormData, setDialog) => {
    if (!user) {
      setDialog({ open: true, type: 'error', message: 'You must be logged in to edit a medication reminder' });
      return;
    }
    if (!formData.medicationName || !formData.reason || !formData.dosage || !formData.medicineTime || !formData.frequencyPerDay) {
      setDialog({ open: true, type: 'error', message: 'Please fill in all required fields' });
      return;
    }
    if (isNaN(formData.frequencyPerDay) || parseInt(formData.frequencyPerDay) <= 0) {
      setDialog({ open: true, type: 'error', message: 'Frequency per day must be a positive number' });
      return;
    }
    if (parseInt(formData.frequencyPerDay) > MAX_FREQUENCY_PER_REMINDER) {
      setDialog({ open: true, type: 'error', message: `Frequency per day cannot exceed ${MAX_FREQUENCY_PER_REMINDER}` });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('medicine_name', formData.medicationName);
      submitData.append('reason', formData.reason);
      submitData.append('dosage', formData.dosage);
      let normalizedTime = formData.medicineTime;
      if (normalizedTime && normalizedTime.length > 5) {
        normalizedTime = normalizedTime.slice(0, 5);
      }
      submitData.append('medicine_time', normalizedTime);
      submitData.append('frequency_per_day', formData.frequencyPerDay);
      if (formData.imageFile) {
        submitData.append('image', formData.imageFile);
      }
      const result = await fetcher(`${backendUrl}/api/medications/${id}`, {
        method: 'PUT',
        body: submitData
      });
      if (result.success) {
        setDialog({ open: true, type: 'success', message: 'Medication reminder updated successfully!' });
      } else {
        const errorMessage = result.errors ? result.errors.join(', ') : result.message || 'Failed to update reminder';
        setDialog({ open: true, type: 'error', message: errorMessage });
      }
    } catch (error) {
      setDialog({ open: true, type: 'error', message: 'Network error. Please check if the server is running and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !formData) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <MedicationReminderForm
      initialValues={formData}
      mode="edit"
      onSubmit={handleEdit}
      isSubmitting={isSubmitting}
      dialog={dialog}
      setDialog={setDialog}
      onCancel={() => navigate('/medical/reminders')}
    />
  );
} 