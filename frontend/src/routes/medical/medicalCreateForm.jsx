import React, { useState, useContext } from 'react';
import { MedicationReminderForm } from './MedicationReminderForm.jsx';
import { UserContext } from '@/provider/UserContext.js';
import { fetcher } from '@/lib/fetcher.js';
import { useNavigate } from 'react-router';

const defaultValues = {
  medicationName: '',
  reason: '',
  dosage: '',
  medicineTime: '',
  frequencyPerDay: '',
  imageFile: null,
  imagePreview: null,
};

export function MedicalCreateForm() {
  const user = useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });
  const navigate = useNavigate();

  const handleCreate = async (formData, setFormData, setDialog) => {
    if (!user) {
      setDialog({ open: true, type: 'error', message: 'You must be logged in to create a medication reminder' });
      return;
    }
    if (!formData.medicationName || !formData.reason || !formData.dosage || !formData.medicineTime || !formData.frequencyPerDay || !formData.imageFile) {
      setDialog({ open: true, type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    if (isNaN(formData.frequencyPerDay) || parseInt(formData.frequencyPerDay) <= 0) {
      setDialog({ open: true, type: 'error', message: 'Frequency per day must be a positive number' });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('medicine_name', formData.medicationName);
      submitData.append('reason', formData.reason);
      submitData.append('dosage', formData.dosage);
      // Ensure medicine_time is in 'HH:MM' format
      let normalizedTime = formData.medicineTime;
      if (normalizedTime && normalizedTime.length > 5) {
        normalizedTime = normalizedTime.slice(0, 5);
      }
      submitData.append('medicine_time', normalizedTime);
      submitData.append('frequency_per_day', formData.frequencyPerDay);
      submitData.append('image', formData.imageFile);

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const result = await fetcher(`${backendUrl}/api/medications`, {
        method: 'POST',
        body: submitData
      });

      
      if (result.success) {
        setFormData(defaultValues);
        setDialog({ open: true, type: 'success', message: 'Medication reminder created successfully!' });
      } else {
        const errorMessage = result.errors ? result.errors.join(', ') : result.message || 'Failed to create reminder';
        setDialog({ open: true, type: 'error', message: errorMessage });
      }
    } catch (error) {
      setDialog({ open: true, type: 'error', message: 'Network error. Please check if the server is running and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MedicationReminderForm
      initialValues={defaultValues}
      mode="create"
      onSubmit={handleCreate}
      isSubmitting={isSubmitting}
      dialog={dialog}
      setDialog={setDialog}
      onCancel={() => navigate('/medical')}
      navigateOnSuccess={() => navigate('/medical/reminders')}
    />
  );
}