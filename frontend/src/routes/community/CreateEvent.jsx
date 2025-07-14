import React, { useRef, useState } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Upload, X } from "lucide-react";

export const CreateEventPage = () => {
  const [setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      if (file.size > 30 * 1024 * 1024) {
        alert("Image size should be less than 30MB");
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

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Event</h2>
        <form className="space-y-6">
          <div>
            <Label htmlFor="eventName" className="mb-2 inline-block">Event Name *</Label>
            <Input id="eventName" placeholder="Enter event name" />
          </div>
          <div>
            <Label htmlFor="location" className="mb-2 inline-block">Location *</Label>
            <Input id="location" placeholder="Enter location" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="date" className="mb-2 inline-block">Date *</Label>
              <Input id="date" type="date" placeholder="Select date" />
            </div>
            <div className="flex-1">
              <Label htmlFor="time" className="mb-2 inline-block">Time *</Label>
              <Input id="time" type="time" placeholder="Select time" />
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="mb-2 inline-block">Description *</Label>
            <Textarea id="description" placeholder="Enter description" rows={3} />
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
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </div>
    </div>
  );
};

 