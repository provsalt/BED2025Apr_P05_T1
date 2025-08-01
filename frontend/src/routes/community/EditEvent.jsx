import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Upload, X, ArrowLeft } from "lucide-react";
import { fetcher } from "../../lib/fetcher";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { UserContext } from '../../provider/UserContext.js';

export const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });
  const [category, setCategory] = useState("");
  const fileInputRef = useRef(null);
  const userContext = React.useContext(UserContext);

  
  // Fetch existing event data
  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError(null);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetcher(`${backendUrl}/api/community/${id}`);
        if (res.success) {
          setEvent(res.event);
          setCategory(res.event.category);
          // Set existing images
          if (res.event.images && Array.isArray(res.event.images)) {
            setExistingImages(res.event.images);
          }
        } else {
          setError("Event not found");
        }
      } catch (err) {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

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

  // Remove a new image before submit
  const removeNewImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImages(newImages);
    setImagePreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove an existing image
  const removeExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
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
      setDialog({ open: true, type: 'error', message: 'You must be logged in to edit an event.' });
      setIsSubmitting(false);
      return;
    }
    
    //get form values
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

    // Check if there's at least one image 
    if (existingImages.length === 0 && images.length === 0) {
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
    
    // Add keepImageIds for existing images that should be kept
    const keepImageIds = existingImages.map(img => img.id);
    // Always send keepImageIds, even if empty 
    formData.append("keepImageIds", JSON.stringify(keepImageIds));

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const result = await fetcher(`${backendUrl}/api/community/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (result.success) {
        setDialog({ open: true, type: "success", message: "Event updated successfully!" });
        // Navigate back to event detail after a short delay
        setTimeout(() => {
          navigate(`/community/event/${id}`);
        }, 1500);
      } else {
        let errorMessage;
        if (result.errors) {
          errorMessage = result.errors.join(", ");
        } else if (result.message) {
          errorMessage = result.message;
        } else {
          errorMessage = "Failed to update event";
        }
        setDialog({ open: true, type: "error", message: errorMessage });
      }
    } catch (err) {
      setDialog({ open: true, type: "error", message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading event...</div>;
  if (error) return <div className="text-center py-8 text-destructive">{error}</div>;
  if (!event) return null;

  return (
    <div className="w-full p-6 bg-muted min-h-screen">
      <div className="bg-background rounded-lg shadow-sm border p-6 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            className="p-0 h-auto cursor-pointer" 
            onClick={() => navigate(`/community/event/${id}`)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Event
          </Button>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-6">Edit Event</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="eventName" className="mb-2 inline-block">Event Name *</Label>
            <Input id="eventName" name="name" placeholder="Enter event name" defaultValue={event.name} />
          </div>
          <div>
            <Label htmlFor="location" className="mb-2 inline-block">Location *</Label>
            <Input id="location" name="location" placeholder="Enter location" defaultValue={event.location} />
          </div>
          <div>
            <Label htmlFor="category" className="mb-2 inline-block cursor-pointer">Category *</Label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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
              <Input 
                id="date" 
                name="date" 
                type="date" 
                placeholder="Select date" 
                defaultValue={(() => {
                  if (event.date) {
                    return event.date.split('T')[0];
                  }
                  return '';
                })()} 
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="time" className="mb-2 inline-block">Time *</Label>
              <Input 
                id="time" 
                name="time" 
                type="time" 
                placeholder="Select time" 
                defaultValue={(() => {
                  if (event.time) {
                    const match = event.time.match(/T(\d{2}:\d{2}):\d{2}/);
                    if (match) {
                      return match[1];
                    }
                    return event.time.slice(0, 5);
                  }
                  return '';
                })()} 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="mb-2 inline-block">Description *</Label>
            <Textarea id="description" name="description" placeholder="Enter description" rows={3} defaultValue={event.description} />
          </div>
          
          {/* Images Section */}
          <div>
            <Label className="mb-2 inline-block">Event Images *</Label>
            <div
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{ borderColor: (() => {
                if (existingImages.length > 0 || images.length > 0) {
                  return "#4f46e5";
                }
                return "#d1d5db";
              })() }}
            >
              <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Click or drag images here</span>
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 30MB each</p>
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
            
            {/* All Images Preview (Existing + New) */}
            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div className="flex flex-wrap gap-3 mt-3">
                {/* Existing Images */}
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={(() => {
                        if (img.image_url.startsWith('http')) {
                          return img.image_url;
                        }
                        return `${import.meta.env.VITE_BACKEND_URL}${img.image_url}`;
                      })()}
                      alt={`Existing ${img.id}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-destructive text-primary-foreground rounded-full p-1 opacity-80 hover:opacity-100 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* New Images */}
                {imagePreviews.map((src, idx) => (
                  <div key={`new-${idx}`} className="relative group">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeNewImage(idx); }}
                      className="absolute top-1 right-1 bg-destructive text-primary-foreground rounded-full p-1 opacity-80 hover:opacity-100 cursor-pointer"
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
              return "Updating...";
            }
            return "Update Event";
          })()}</Button>
        </form>
        <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
          <DialogContent className="rounded-xl">
            <DialogHeader>
              <DialogTitle className={(() => {
                if (dialog.type === 'error') {
                  return 'text-destructive';
                }
                return 'text-primary';
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
              <Button className="cursor-pointer" onClick={() => setDialog(d => ({ ...d, open: false }))}>Okay</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}; 