import React, { useState } from "react";
import {Button} from "@/components/ui/button.jsx";
import {Card} from "@/components/ui/card.jsx";
import { fetcher } from "@/lib/fetcher.js";
import { useAlert } from "@/provider/AlertProvider.jsx";
import { X } from "lucide-react";

export const FoodImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [showError, setShowError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const alert = useAlert();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setShowError(false);
      setAnalysisResult(null); // Clear previous analysis
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewURL(null);
    setShowError(false);
    setAnalysisResult(null); // Clear analysis when removing image
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setShowError(true);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/food/upload`, {
        method: "POST",
        body: formData
      });

      alert.success({
        title: "Upload Successful",
        description: "Food image uploaded and analyzed successfully!",
      });
      if (response.analysis) {
        setAnalysisResult(response.analysis);
      }
    } catch (error) {
      alert.error({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // If analysisResult exists, show the result page
  if (analysisResult) {
    return (
      <div className="flex-1 p-3 flex flex-col items-center justify-center">
        <Card className="p-8 max-w-2xl w-full mx-auto bg-white space-y-6">
          <h2 className="text-2xl font-bold text-center mb-6">Food Analysis Result</h2>
          {previewURL && (
            <div className="flex justify-center mb-6">
              <img
                src={previewURL}
                alt="Food Preview"
                className="max-h-64 rounded-lg border border-gray-300 shadow-md object-contain"
              />
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800">Food Name</h4>
                <p className="text-gray-600">{analysisResult.foodName || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Category</h4>
                <p className="text-gray-600">{analysisResult.category || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Carbohydrates (g)</h4>
                <p className="text-gray-600">{analysisResult.carbohydrates || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Protein (g)</h4>
                <p className="text-gray-600">{analysisResult.protein || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Fat (g)</h4>
                <p className="text-gray-600">{analysisResult.fat || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Calories</h4>
                <p className="text-gray-600">{analysisResult.calories || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-800">Ingredients</h4>
                <p className="text-gray-600">{Array.isArray(analysisResult.ingredients) ? analysisResult.ingredients.join(", ") : (analysisResult.ingredients || "-")}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <Button onClick={() => {
              setAnalysisResult(null);
              setSelectedImage(null);
              setPreviewURL(null);
            }} className="px-6 py-2 text-base font-semibold">
              Upload Another Image
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Default upload page
  return (
    <div className="min-h-screen p-3">
      <div className="max-w-4xl mx-auto">
        <h1 onClick={() => {window.location.href = "/nutrients";}} className=" cursor-pointer text-2xl font-bold mb-8 text-center">Nutrition</h1>
        <Card className="p-8 max-w-2xl mx-auto bg-white space-y-6">
          <h2 className="text-xl font-bold text-center">Upload Food Image</h2>
          {/* Information section */}
          <div className="text-center space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Why Scan Your Food?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Scanning your meal helps you instantly understand what you're eating. Get accurate details about calories, protein, carbohydrates, and fats all so you can make smarter choices for your health, track your diet easily, and stay informed without the guesswork.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                {previewURL ? (
                  <>
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors z-9"
                      type="button"
                    >
                      <X size={14} />
                    </button>
                    <img
                      src={previewURL}
                      alt="Preview"
                      className="max-w-full h-auto rounded-lg border border-gray-300 shadow-md"
                    />
                  </>
                ) : (
                  <label className="block cursor-pointer">
                    <div 
                      className="w-64 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-gray-400', 'bg-gray-100');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-gray-400', 'bg-gray-100');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-gray-400', 'bg-gray-100');
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          const file = files[0];
                          if (file.type.startsWith('image/')) {
                            setSelectedImage(file);
                            setPreviewURL(URL.createObjectURL(file));
                            setShowError(false);
                          }
                        }
                      }}
                    >
                      <div className="text-center text-gray-700">
                        <p className="text-sm">Click or drag image here</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
            {showError && (
              <p className="text-red-500 text-sm text-center">No File Chosen</p>
            )}
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={isUploading}
                className="px-8 py-3 text-lg font-semibold cursor-pointer"
              >
                {isUploading ? "Uploading..." : "Analyse"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
