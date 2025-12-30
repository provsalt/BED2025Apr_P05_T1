import React, { useState, useContext } from "react";
import { MedicationReminderForm } from "./MedicationReminderForm.jsx";
import { UserContext } from "@/provider/UserContext.js";
import { fetcher } from "@/lib/fetcher.js";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";

//limit max reminder and max frequency
const MAX_REMINDERS_PER_USER = 3;
const MAX_FREQUENCY_PER_REMINDER = 3;

const defaultValues = {
  medicationName: '',
  reason: '',
  dosage: '',
  medicineTime: '',
  frequencyPerDay: '',
  imageFile: null,
  imagePreview: null
};

export const MedicalCreateForm = () =>  {
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
    
    if (parseInt(formData.frequencyPerDay) > MAX_FREQUENCY_PER_REMINDER) {
      setDialog({ open: true, type: 'error', message: `Frequency per day cannot exceed ${MAX_FREQUENCY_PER_REMINDER}` });
      return;
    }
    // Check max reminders per user
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const remindersResult = await fetcher(`${backendUrl}/api/medications`);
      if (remindersResult.success && remindersResult.reminders.length >= MAX_REMINDERS_PER_USER) {
        setDialog({ open: true, type: 'error', message: `You can only have up to ${MAX_REMINDERS_PER_USER} medication reminders.` });
        return;
      }
    } catch (err) {
      setDialog({ open: true, type: 'error', message: 'Could not check your current reminders. Please try again.' });
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
    <PageContainer>
      <PageHeader
        breadcrumbs={[
          { label: "Medical", href: "/medical" },
          { label: "Create Medication" },
        ]}
        title="Create Medication Reminder"
      />
      <div className="max-w-md mx-auto">
        <MedicationReminderForm
          initialValues={defaultValues}
          mode="create"
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          dialog={dialog}
          setDialog={setDialog}
          onCancel={() => navigate("/medical")}
          navigateOnSuccess={() => navigate("/medical/reminders")}
        />
      </div>
    </PageContainer>
  );
};