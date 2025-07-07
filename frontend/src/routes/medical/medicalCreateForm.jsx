import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export const MedicationReminderForm = () => {
  const [formData, setFormData] = useState({
    medicationName: '',
    reason: '',
    dosage: '',
    timeToTake: '',
    frequencyPerDay: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.medicationName || !formData.reason || !formData.dosage || 
        !formData.timeToTake || !formData.frequencyPerDay) {
      alert('Please fill in all required fields');
      return;
    }

    if (isNaN(formData.frequencyPerDay) || parseInt(formData.frequencyPerDay) <= 0) {
        alert('Frequency per day must be a positive number');
        return;
    }


    setIsSubmitting(true);

    try {
      //api call to backend
      const response = await fetch('http://localhost:3000/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // reset form after successful submission
        setFormData({
          medicationName: '',
          reason: '',
          dosage: '',
          timeToTake: '',
          frequencyPerDay: ''
        });
        
        alert('Medication reminder created successfully!');
      } else {
        //handle errors
        const errorMessage = result.errors 
          ? result.errors.join(', ') 
          : result.message || 'Failed to create reminder';
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please check if the server is running and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      medicationName: '',
      reason: '',
      dosage: '',
      timeToTake: '',
      frequencyPerDay: ''
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-xl font-semibold text-gray-700">
            Create Medication Reminder
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardHeader>
        
        <CardContent>
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
                className="w-full min-h-[80px] resize-none"
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
              <Label htmlFor="timeToTake" className="text-sm font-medium text-gray-700">
                Time to Take *
              </Label>
              <Input
                id="timeToTake"
                type="time"
                placeholder="e.g., 8:00 AM or 08:00"
                value={formData.timeToTake}
                onChange={(e) => handleInputChange('timeToTake', e.target.value)}
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
                placeholder="Enter number of times per day"
                value={formData.frequencyPerDay}
                onChange={(e) => handleInputChange('frequencyPerDay', e.target.value)}
                className="w-full"
                min={1}
              />
            </div>


            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {isSubmitting ? 'Creating...' : 'Set Reminder'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

