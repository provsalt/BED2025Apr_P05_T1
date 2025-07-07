import React, { useState } from "react";
import {Button} from "@/components/ui/button.jsx";
import {Card} from "@/components/ui/card.jsx";

export const FoodImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [showError, setShowError] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setShowError(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewURL(null);
    setShowError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setShowError(true);
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="min-h-screen p-3">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Nutrition - Food Image Upload</h1>
        
        <Card className="p-8 max-w-2xl mx-auto bg-white space-y-6">
          <h2 className="text-2xl font-bold text-center">Insert your Food Image</h2>

          <div className="space-y-6">
            <div className="relative flex justify-center">
              <label className="block w-full text-center cursor-pointer">
                <span className="inline-block px-8 py-4 bg-blue-50 text-blue-700 rounded-full font-semibold text-lg hover:bg-blue-100 transition-colors">
                  Choose File
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            
            {showError && (
              <p className="text-red-500 text-sm text-center">No File Chosen</p>
            )}

            {previewURL && (
              <div className="flex justify-center">
                <div className="relative">
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors z-9"
                    type="button"
                  >
                    x
                  </button>
                  <img
                    src={previewURL}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg border border-gray-300 shadow-md"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                className="px-8 py-3 text-lg font-semibold"
              >
                Submit for Analysis
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}