import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { UserContext } from '@/provider/UserContext.js';
import { fetcher } from '@/lib/fetcher.js';
import { Link } from 'react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export const MedicationReminderForm = ({ userId = null }) => {
  const userContext = useContext(UserContext);
  const UserId = userId || userContext?.id;
  const [formData, setFormData] = useState({
    medicationName: '',
    reason: '',
    dosage: '',
    medicineTime: '',
    frequencyPerDay: '',
    imageFile: null,
    imagePreview: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setDialog({ open: true, type: 'error', message: 'Please select a valid image file' });
        return;
      }
      
      if (file.size > 30 * 1024 * 1024) {
        setDialog({ open: true, type: 'error', message: 'Image size should be less than 30MB' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null
    }));
  };

  const handleSubmit = async () => {
    if (!UserId) {
      setDialog({ open: true, type: 'error', message: 'You must be logged in to create a medication reminder' });
      return;
    }

    if (!formData.medicationName || !formData.reason || 
        !formData.dosage || !formData.medicineTime || !formData.frequencyPerDay || 
        !formData.imageFile) {
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
        setFormData({
          medicationName: '',
          reason: '',
          dosage: '',
          medicineTime: '',
          frequencyPerDay: '',
          imageFile: null,
          imagePreview: null
        });
        
        setDialog({ open: true, type: 'success', message: 'Medication reminder created successfully!' });
      } else {
        const errorMessage = result.errors 
          ? result.errors.join(', ') 
          : result.message || 'Failed to create reminder';
        setDialog({ open: true, type: 'error', message: errorMessage });
      }
    } catch (error) {
      setDialog({ open: true, type: 'error', message: 'Network error. Please check if the server is running and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      medicationName: '',
      reason: '',
      dosage: '',
      medicineTime: '',
      frequencyPerDay: '',
      imageFile: null,
      imagePreview: null
    });
  };

  return (
    <div className="w-full p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Create Medication Reminder</h1>
          <Link to="/medical">
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-gray-400 hover:bg-gray-500 text-white cursor-pointer"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="medicationName" className="text-sm font-medium text-gray-700">
              Medication Name *
            </Label>
            <Input
              id="medicationName"
              placeholder="Enter medication name"
              value={formData.medicationName}
              onChange={(e) => handleInputChange('medicationName', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Reason for Taking *
            </Label>
            <Textarea
              id="reason"
              placeholder="Why are you taking this medication?"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className="w-full h-16 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage" className="text-sm font-medium text-gray-700">
              Dosage *
            </Label>
            <Input
              id="dosage"
              placeholder="e.g., 1 tablet, 5ml"
              value={formData.dosage}
              onChange={(e) => handleInputChange('dosage', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicineTime" className="text-sm font-medium text-gray-700">
              Time to Take *
            </Label>
            <Input
              id="medicineTime"
              type="time"
              placeholder="e.g., 8:00 AM or 08:00"
              value={formData.medicineTime}
              onChange={(e) => handleInputChange('medicineTime', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequencyPerDay" className="text-sm font-medium text-gray-700">
              Frequency per Day *
            </Label>
            <Input
              id="frequencyPerDay"
              type="number"
              placeholder="e.g., 1, 2, 3..."
              value={formData.frequencyPerDay}
              onChange={(e) => handleInputChange('frequencyPerDay', e.target.value)}
              className="w-full"
              min="1"
              max="10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUpload" className="text-sm font-medium text-gray-700">
              Medication Image *
            </Label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="imageUpload"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center p-2">
                    <Upload className="w-6 h-6 mb-1 text-gray-500" />
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Click to upload</span> image
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    id="imageUpload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              
              {formData.imagePreview && (
                <div className="relative">
                  <img
                    src={formData.imagePreview}
                    alt="Medication preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Set Reminder'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6 cursor-pointer"
            >
              Cancel
            </Button>
          </div>

          <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={dialog.type === 'error' ? 'text-red-700' : 'text-green-700'}>
              {dialog.type === 'error' ? 'Error' : 'Success'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">{dialog.message}</div>
          <DialogFooter>
            <Button onClick={() => setDialog(d => ({ ...d, open: false }))}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
};