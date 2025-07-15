import React, { useRef, useState } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Upload, X } from "lucide-react";
import { fetcher } from "../../lib/fetcher";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";

export const CreateEventPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [category, setCategory] = useState("");
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
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

  const handleFeedbackClose = () => {
    setFeedback({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.target);
    formData.set("category", category);
    // Ensure time is always sent as HH:mm 
    let time = formData.get("time");
    if (time && time.length > 5) {
      time = time.slice(0, 5);
      formData.set("time", time);
    }
    formData.set("image", imageFile);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const result = await fetcher(`${backendUrl}/api/community/create`, {
        method: "POST",
        body: formData
      });
      if (result.success) {
        event.target.reset();
        setImageFile(null);
        setImagePreview(null);
        setCategory("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFeedback({ type: "success", message: "Event created!" });
      } else {
        let errorMessage;
        if (result.errors) {
          errorMessage = result.errors.join(", ");
        } else if (result.message) {
          errorMessage = result.message;
        } else {
          errorMessage = "Failed to create event";
        }
        setFeedback({ type: "error", message: errorMessage });
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error. Please check if the server is running and try again." });
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

        <Dialog open={!!feedback.message} onOpenChange={open => { if (!open) setFeedback({ type: "", message: "" }); }}>
          <DialogContent className="rounded-xl">
            <DialogHeader>
              {(() => {
                let titleClass = "text-red-700";
                let titleText = "Error";
                if (feedback.type === "success") {
                  titleClass = "text-green-700";
                  titleText = "Success";
                }
                return <DialogTitle className={titleClass}>{titleText}</DialogTitle>;
              })()}
            </DialogHeader>
            <div className="py-2">{feedback.message}</div>
            <DialogFooter>
              <Button className="cursor-pointer" onClick={handleFeedbackClose}>Okay</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

 