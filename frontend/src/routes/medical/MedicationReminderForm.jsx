import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router';
import { produce } from 'immer';

const defaultValues = {
  medicationName: '',
  reason: '',
  dosage: '',
  medicineTime: '',
  frequencyPerDay: '',
  imageFile: null,
  imagePreview: null,
};

export function MedicationReminderForm({
  initialValues = defaultValues,
  mode = 'create',
  onSubmit,
  isSubmitting = false,
  dialog,
  setDialog,
  onCancel,
  navigateOnSuccess,
}) {
  const [formData, setFormData] = useState(initialValues);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => produce(prev, draft => {
      draft[field] = value;
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        if (setDialog) {
          setDialog({ open: true, type: 'error', message: 'Please select a valid image file' });
        }
        return;
      }
      if (file.size > 30 * 1024 * 1024) {
        if (setDialog) {
          setDialog({ open: true, type: 'error', message: 'Image size should be less than 30MB' });
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => produce(prev, draft => {
          draft.imageFile = file;
          draft.imagePreview = e.target.result;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => produce(prev, draft => {
      draft.imageFile = null;
      draft.imagePreview = null;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, setFormData, setDialog);
  };

  const renderImagePreview = () => {
    if (!formData.imagePreview && !formData.oldImageUrl) {
      return null;
    }

    let imageSrc = '';
    if (formData.imagePreview) {
      imageSrc = formData.imagePreview;
    } else if (formData.oldImageUrl) {
      if (formData.oldImageUrl.startsWith('http')) {
        imageSrc = formData.oldImageUrl;
      } else {
        imageSrc = (import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') + formData.oldImageUrl);
      }
    }

    return (
      <div className="relative">
        <img
          src={imageSrc}
          alt="Medication preview"
          className="w-full h-32 object-cover rounded-lg border"/>
        {formData.imagePreview && (
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) {
      if (mode === 'edit') {
        return 'Saving...';
      } else {
        return 'Creating...';
      }
    } else {
      if (mode === 'edit') {
        return 'Save Changes';
      } else {
        return 'Set Reminder';
      }
    }
  };

  const getDialogTitleClass = () => {
    if (dialog.type === 'error') {
      return 'text-destructive';
    } else {
      return 'text-primary';
    }
  };

  const getDialogTitleText = () => {
    if (dialog.type === 'error') {
      return 'Error';
    } else {
      return 'Success';
    }
  };

  const handleDialogOpenChange = (open) => {
    setDialog(d => ({ ...d, open }));
    if (!open && mode === 'edit' && dialog.type === 'success') {
      navigate('/medical/reminders');
    }
  };

  const handleDialogOkayClick = () => {
    setDialog(d => ({ ...d, open: false }));
    if (mode === 'edit' && dialog.type === 'success') {
      navigate('/medical/reminders');
    }
    if (mode === 'create' && dialog.type === 'success' && typeof navigateOnSuccess === 'function') {
      navigateOnSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-6 bg-muted">
      <div className="bg-background rounded-lg shadow-sm border p-6 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Medication Name */}
          <div className="space-y-2">
            <Label htmlFor="medicationName">Medication Name *</Label>
            <Input
              id="medicationName"
              value={formData.medicationName}
              onChange={e => handleInputChange('medicationName', e.target.value)}
              className="w-full"
              placeholder="Enter medication name"
            />
          </div>
          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Taking *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={e => handleInputChange('reason', e.target.value)}
              className="w-full h-16 resize-none"
              placeholder="Why are you taking this medication?"
            />
          </div>
          {/* Dosage */}
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage *</Label>
            <Input
              id="dosage"
              value={formData.dosage}
              onChange={e => handleInputChange('dosage', e.target.value)}
              className="w-full"
              placeholder="e.g., 1 tablet, 5ml"
            />
          </div>
          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="medicineTime">Time to Take *</Label>
            <Input
              id="medicineTime"
              type="time"
              value={formData.medicineTime}
              onChange={e => handleInputChange('medicineTime', e.target.value)}
              className="w-full"
            />
          </div>
          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequencyPerDay">Frequency per Day *</Label>
            <Input
              id="frequencyPerDay"
              type="number"
              value={formData.frequencyPerDay}
              onChange={e => handleInputChange('frequencyPerDay', e.target.value)}
              className="w-full"
              min="1"
              max="10"
              placeholder="e.g., 1, 2, 3..."
            />
          </div>
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="imageUpload">Medication Image *</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="imageUpload"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-muted-foreground border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                >
                  <div className="flex flex-col items-center justify-center p-2">
                    <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> image
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
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
              {(formData.imagePreview || formData.oldImageUrl) && (() => {
                let imageSrc = '';
                if (formData.imagePreview) {
                  imageSrc = formData.imagePreview;
                } else if (formData.oldImageUrl) {
                  if (formData.oldImageUrl.startsWith('http')) {
                    imageSrc = formData.oldImageUrl;
                  } else {
                    imageSrc = (import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') + formData.oldImageUrl);
                  }
                }
                return (
                  <div className="relative">
                    <img
                      src={imageSrc}
                      alt="Medication preview"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    {formData.imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-destructive text-primary-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
          {/* Submit/Cancel */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 cursor-pointer">
              {getSubmitButtonText()}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="px-6 cursor-pointer">
              Cancel
            </Button>
          </div>
          {/* Dialog */}
          {dialog && (
            <Dialog open={dialog.open} onOpenChange={handleDialogOpenChange}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className={getDialogTitleClass()}>
                    {getDialogTitleText()}
                  </DialogTitle>
                </DialogHeader>
                <div className="py-2">{dialog.message}</div>
                <DialogFooter>
                  <Button onClick={handleDialogOkayClick}>
                    Okay
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </form>
  );
} 