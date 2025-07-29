import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Upload, X } from "lucide-react";
import { fetcher } from "../../lib/fetcher";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { UserContext } from '../../provider/UserContext.js';

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });
  const [category, setCategory] = useState("");
  const fileInputRef = useRef(null);
  const userContext = React.useContext(UserContext);



  // Handle file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file =>
      ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type) && file.size <= 30 * 1024 * 1024
    );
    // Allow all valid files to be added 
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    validFiles.forEach(file => {
      newImages.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });
    setImages(newImages);
    setImagePreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove an image before submit
  const removeImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImages(newImages);
    setImagePreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag and drop support
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleImageChange({ target: { files } });
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    //check if user logged in
    if (!userContext || !userContext.isAuthenticated || !userContext.id) {
      setDialog({ open: true, type: 'error', message: 'You must be logged in to create an event.' });
      setIsSubmitting(false);
      return;
    }
    
    // Get form values
    const eventName = e.target.name.value.trim();
    const location = e.target.location.value.trim();
    const date = e.target.date.value;
    const time = e.target.time.value;
    const description = e.target.description.value.trim();
    if (!eventName || !location || !category || !date || !time || !description) {
      setDialog({ open: true, type: 'error', message: 'Please fill in all required fields.' });
      setIsSubmitting(false);
      return;
    }

    if (images.length === 0) {
      setDialog({ open: true, type: 'error', message: 'Please upload at least one image for your event.' });
      setIsSubmitting(false);
      return;
    }

    //date time cannot be in the past
    const eventDateTime = new Date(`${date}T${time}:00`);
    if (eventDateTime < new Date()) {
      setDialog({ open: true, type: 'error', message: 'Date/time cannot be in the past' });
      setIsSubmitting(false);
      return;
    }
    
    const formData = new FormData(e.target);
    images.forEach((file) => formData.append("images", file));

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const result = await fetcher(`${backendUrl}/api/community/create`, {
        method: "POST",
        body: formData,
      });
      if (result.success) {
        setDialog({ open: true, type: "success", message: "Event created!" });
        setImages([]);
        setImagePreviews([]);
        e.target.reset();
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        let errorMessage;
        if (result.errors) {
          errorMessage = result.errors.join(", ");
        } else if (result.message) {
          errorMessage = result.message;
        } else {
          errorMessage = "Failed to create event";
        }
        setDialog({ open: true, type: "error", message: errorMessage });
      }
    } catch (err) {
      setDialog({ open: true, type: "error", message: "Network error. Please try again." });
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
          <div>
            <Label className="mb-2 inline-block">Event Images *</Label>
            <div
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{ borderColor: (() => {
                if (images.length) {
                  return "#4f46e5";
                }
                return "#d1d5db";
              })() }}
            >
              <Upload className="w-6 h-6 mb-1 text-gray-500" />
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Click or drag images here</span>
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 30MB each</p>
              <input
                id="eventImages"
                name="images"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </div>
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>{(() => {
            if (isSubmitting) {
              return "Submitting...";
            }
            return "Submit";
          })()}</Button>
        </form>
        <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
          <DialogContent className="rounded-xl">
            <DialogHeader>
              <DialogTitle className={(() => {
                if (dialog.type === 'error') {
                  return 'text-red-700';
                }
                return 'text-green-700';
              })()}>
                {(() => {
                  if (dialog.type === 'error') {
                    return 'Error';
                  }
                  return 'Success';
                })()}
              </DialogTitle>
            </DialogHeader>
             <div className="py-2">{dialog.message}</div>
             <DialogFooter>
               <Button className="cursor-pointer" onClick={() => {
                 setDialog(d => ({ ...d, open: false }));
                 if (dialog.type === 'success') {
                   navigate('/community/myevents');
                 }
               }}>Okay</Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

 