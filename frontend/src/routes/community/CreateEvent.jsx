import React, { useRef, useState } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Upload, X } from "lucide-react";
import { fetcher } from "../../lib/fetcher";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { UserContext } from '../../provider/UserContext.js';

export const CreateEventPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });
  const [category, setCategory] = useState("");
  const fileInputRef = useRef(null);
  const userContext = React.useContext(UserContext);

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
        setImageFile(file);
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    //check if user logged in
    if (!userContext || !userContext.isAuthenticated || !userContext.id) {
      setDialog({ open: true, type: 'error', message: 'You must be logged in to create an event.' });
      setIsSubmitting(false);
      return;
    }
    
    // Get form values
    const eventName = event.target.name.value.trim();
    const location = event.target.location.value.trim();
    const date = event.target.date.value;
    const time = event.target.time.value;
    const description = event.target.description.value.trim();
    if (!eventName || !location || !category || !date || !time || !description || !imageFile) {
      setDialog({ open: true, type: 'error', message: 'Please fill in all required fields' });
      setIsSubmitting(false);
      return;
    }

    //date cannnot be in the past
    const today = new Date();
    today.setHours(0,0,0,0);
    const inputDate = new Date(date);
    inputDate.setHours(0,0,0,0);
    if (inputDate < today) {
      setDialog({ open: true, type: 'error', message: 'Date cannot be in the past' });
      setIsSubmitting(false);
      return;
    }
    // If date is today, check if time is in the past
    if (inputDate.getTime() === today.getTime()) {
      const now = new Date();
      const [inputHour, inputMinute] = time.split(":");
      const eventTime = new Date();
      eventTime.setHours(Number(inputHour), Number(inputMinute), 0, 0);
      if (eventTime < now) {
        setDialog({ open: true, type: 'error', message: 'Time cannot be in the past for today' });
        setIsSubmitting(false);
        return;
      }
    }
    
    const formData = new FormData(event.target);
    formData.set('category', category);
    let timeValue = formData.get('time');
    if (timeValue && timeValue.length > 5) {
      timeValue = timeValue.slice(0, 5);
      formData.set('time', timeValue);
    }
    formData.set('image', imageFile);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const result = await fetcher(`${backendUrl}/api/community/create`, {
        method: 'POST',
        body: formData
      });

      if (result.success) {
        event.target.reset();
        setImageFile(null);
        setImagePreview(null);
        setCategory("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setDialog({ open: true, type: 'success', message: 'Event created!' });
      } else {
        let errorMessage;
        if (result.errors) {
          errorMessage = result.errors.join(", ");
        } else if (result.message) {
          errorMessage = result.message;
        } else {
          errorMessage = "Failed to create event";
        }
        setDialog({ open: true, type: 'error', message: errorMessage });
      }
    } catch (err) {
      setDialog({ open: true, type: 'error', message: 'Network error. Please check if the server is running and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Event</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="eventName" className="mb-2 inline-block">Event Name *</Label>
            <Input id="eventName" name="name" placeholder="Enter event name" />
          </div>
          <div>
            <Label htmlFor="location" className="mb-2 inline-block">Location *</Label>
            <Input id="location" name="location" placeholder="Enter location" />
          </div>
          <div>
            <Label htmlFor="category" className="mb-2 inline-block cursor-pointer">Category *</Label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              required
            >
              <option value="" disabled>Select a category</option>
              <option value="sports">Sports</option>
              <option value="arts">Arts</option>
              <option value="culinary">Culinary</option>
              <option value="learn">Learn</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="date" className="mb-2 inline-block">Date *</Label>
              <Input id="date" name="date" type="date" placeholder="Select date" />
            </div>
            <div className="flex-1">
              <Label htmlFor="time" className="mb-2 inline-block">Time *</Label>
              <Input id="time" name="time" type="time" placeholder="Select time" />
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="mb-2 inline-block">Description *</Label>
            <Textarea id="description" name="description" placeholder="Enter description" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventImage" className="text-sm font-medium text-gray-700">
              Event Image *
            </Label>
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="eventImage"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center p-2">
                    <Upload className="w-6 h-6 mb-1 text-gray-500" />
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Click to upload</span> image
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 30MB</p>
                  </div>
                  <input
                    id="eventImage"
                    name="image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Event preview"
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
          <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>{(() => { if (isSubmitting) { return "Submitting..."; } else { return "Submit"; } })()}</Button>
        </form>

        <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
          <DialogContent className="rounded-xl">
            <DialogHeader>
              <DialogTitle className={dialog.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                {(() => { if (dialog.type === 'error') { return 'Error'; } else { return 'Success'; } })()}
              </DialogTitle>
            </DialogHeader>
            <div className="py-2">{dialog.message}</div>
            <DialogFooter>
              <Button className="cursor-pointer" onClick={() => setDialog(d => ({ ...d, open: false }))}>Okay</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

 