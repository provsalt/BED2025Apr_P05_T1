import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { fetcher } from "@/lib/fetcher.js";
import { useAlert } from "@/provider/AlertProvider.jsx";
import { X, Upload, Image as ImageIcon, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

export const MealImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const alert = useAlert();

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert.error({
        title: "Invalid File Type",
        description: "Please select an image file.",
      });
      return;
    }

    setSelectedImage(file);
    setPreviewURL((prevURL) => {
      if (prevURL) {
        URL.revokeObjectURL(prevURL);
      }
      return URL.createObjectURL(file);
    });
    setAnalysisResult(null);
  }, [alert]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setPreviewURL((prevURL) => {
      if (prevURL) {
        URL.revokeObjectURL(prevURL);
      }
      return null;
    });
    setAnalysisResult(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert.error({
        title: "No Image Selected",
        description: "Please select an image to analyze.",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetcher(
        `${import.meta.env.VITE_BACKEND_URL}/api/nutrition/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.analysis) {
        setAnalysisResult(response.analysis);
        alert.success({
          title: "Analysis Complete",
          description: "Food image analyzed successfully!",
        });
      } else {
        throw new Error("No analysis data received");
      }
    } catch (error) {
      alert.error({
        title: "Upload Failed",
        description: error.message || "Failed to upload and analyze image. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetToUpload = () => {
    removeImage();
  };

  // Analysis Result View
  if (analysisResult) {
    return (
      <PageContainer className="max-w-none">
        <PageHeader
          breadcrumbs={[
            { label: "Nutrition", href: "/nutrition" },
            { label: "Analysis Result" },
          ]}
          title="Food Analysis Result"
        >
          <Button asChild variant="outline" className="cursor-pointer">
            <Link to="/nutrition">View All Meals</Link>
          </Button>
        </PageHeader>

        <div className="space-y-6">
          {/* Image and Analysis Details Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Preview */}
            {previewURL && (
              <Card className="flex flex-col p-0 overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={previewURL}
                    alt="Analyzed Food"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </Card>
            )}

          {/* Analysis Details */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">{analysisResult.name || "Unknown Food"}</CardTitle>
              </div>
              {analysisResult.category && (
                <CardDescription className="text-base">
                  Category: {analysisResult.category}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Calories</p>
                  <p className="text-2xl font-bold">{analysisResult.calories || "-"}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Protein</p>
                  <p className="text-2xl font-bold">{analysisResult.protein || "-"}</p>
                  <p className="text-xs text-muted-foreground">grams</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Carbohydrates</p>
                  <p className="text-2xl font-bold">{analysisResult.carbohydrates || "-"}</p>
                  <p className="text-xs text-muted-foreground">grams</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Fat</p>
                  <p className="text-2xl font-bold">{analysisResult.fat || "-"}</p>
                  <p className="text-xs text-muted-foreground">grams</p>
                </div>
              </div>

              {analysisResult.ingredients && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Ingredients</p>
                  <p className="text-foreground">
                    {Array.isArray(analysisResult.ingredients)
                      ? analysisResult.ingredients.join(", ")
                      : analysisResult.ingredients}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={resetToUpload}
              variant="outline"
              className="cursor-pointer"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Another Image
            </Button>
            <Button asChild className="cursor-pointer">
              <Link to="/nutrition">
                View All Meals
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Upload View
  return (
    <PageContainer className="max-w-none">
      <PageHeader
        breadcrumbs={[
          { label: "Nutrition", href: "/nutrition" },
          { label: "Upload Image" },
        ]}
        title="Upload Food Image"
      >
        <Button asChild variant="outline" className="cursor-pointer">
          <Link to="/nutrition">View All Meals</Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        {/* Left Column - Two stacked cards */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {/* How to Use Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                How to Use
              </CardTitle>
              <CardDescription className="text-base">
                Follow these simple steps to analyze your food
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5 flex-shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">Take or Select a Photo</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Take a clear photo of your meal or select an existing image from your device.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5 flex-shrink-0">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">Upload Your Image</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click or drag and drop your image file (PNG, JPG, WEBP up to 10MB).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5 flex-shrink-0">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">Analyze Your Food</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click "Analyze Food" to process your image and get nutritional information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5 flex-shrink-0">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">View Your Results</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Review the nutritional breakdown and view your saved meal in nutrition history.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why Scan Your Food Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Why Scan Your Food?</CardTitle>
              <CardDescription className="text-base">
                Get instant nutritional insights from your meal photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">Instant Analysis</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get detailed nutritional information in seconds with AI-powered analysis.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">Track Your Diet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monitor your daily calorie and nutrient intake with complete meal records.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">Make Better Choices</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Understand what you're eating to make informed nutrition decisions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">Save Time</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      No manual data entry needed. Just take a photo and let the system do the work.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Card - Takes up 3 columns on large screens */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select or drag your food image
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
              {/* Image Preview or Upload Area */}
              <div className="flex-1 flex items-center justify-center w-full">
                {previewURL ? (
                  <div className="relative group w-full max-w-full flex items-center justify-center">
                    <Button
                      onClick={removeImage}
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 z-10"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="relative w-full flex items-center justify-center">
                      <Image
                        src={previewURL}
                        alt="Preview"
                        className="max-w-full max-h-full w-auto h-auto rounded-lg border border-muted shadow-md object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <label
                    className={cn(
                      "relative flex flex-col items-center justify-center w-full h-full min-h-[400px] border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted bg-muted/30 hover:bg-muted/50"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center space-y-4 text-center px-4">
                      {isDragging ? (
                        <>
                          <Upload className="h-16 w-16 text-primary" />
                          <div>
                            <p className="text-lg font-semibold text-foreground">
                              Drop your image here
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-full bg-primary/10 p-6">
                            <ImageIcon className="h-12 w-12 text-primary" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              PNG, JPG, WEBP up to 10MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={!selectedImage || isUploading}
                  size="lg"
                  className="cursor-pointer w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Analyze Food
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
