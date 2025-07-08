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
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/food-image-upload`, {
        method: "POST",
        body: formData
      });

      console.log("Upload successful:", response);
      
      // Show success message
      alert.success({
        title: "Upload Successful",
        description: "Food image uploaded and analyzed successfully!",
      });
      
      // Store analysis result
      if (response.analysis) {
        setAnalysisResult(response.analysis);
      }
      
    } catch (error) {
      console.error("Error uploading image:", error);
      
      // Show error message
      alert.error({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-3">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">Nutrition</h1>
        
        <Card className="p-8 max-w-2xl mx-auto bg-white space-y-6">
          <h2 className="text-xl font-bold text-center">Upload Food Image</h2>

          {/* Information section */}
          <div className="text-center space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Why Scan Your Food?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Scanning your meal helps you instantly understand what you're eating. Get accurate details about calories, protein, carbohydrates, and fats — so you can make smarter choices for your health, track your diet easily, and stay informed without the guesswork.
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

            {/* Analysis Results */}
            {analysisResult && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">
                  Nutritional Analysis Results
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800">Food Item</h4>
                      <p className="text-gray-600">{analysisResult.foodName || "Not identified"}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800">Description</h4>
                      <p className="text-gray-600">{analysisResult.description || "No description available"}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800">Serving Size</h4>
                      <p className="text-gray-600">{analysisResult.servingSize || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800">Calories</h4>
                      <p className="text-gray-600">{analysisResult.calories || "Not available"}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-800">Protein:</span>
                        <span className="text-gray-600 ml-1">{analysisResult.protein || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Carbs:</span>
                        <span className="text-gray-600 ml-1">{analysisResult.carbohydrates || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Fat:</span>
                        <span className="text-gray-600 ml-1">{analysisResult.fat || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Fiber:</span>
                        <span className="text-gray-600 ml-1">{analysisResult.fiber || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {analysisResult.healthTips && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-medium text-blue-800 mb-2">Health Tips</h4>
                    <p className="text-blue-700 text-sm">{analysisResult.healthTips}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}