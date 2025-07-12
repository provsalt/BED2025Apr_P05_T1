import { useState, useRef } from "react";
import { fetcher } from "@/lib/fetcher.js";

export function useProfilePicture({ auth, setProfilePictureUrl, alert }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef(null);

  function handleProfilePictureChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (!allowedTypes.includes(file.type)) {
      alert.error({
        title: "Invalid File Type",
        description: "Please select a JPEG, JPG, PNG, or WEBP image file.",
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }
    if (file.size > maxSize) {
      alert.error({
        title: "File Too Large",
        description: "Please select an image smaller than 8MB.",
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
    setUploadStatus(`Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  }

  async function handleProfilePictureUpload() {
    if (!selectedFile) return;
    const data = new FormData();
    data.append("avatar", selectedFile);
    try {
      setUploadStatus("Uploading...");
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/picture`, {
        method: "POST",
        body: data
      });
      setProfilePictureUrl(response.url);
      setSelectedFile(null);
      setUploadStatus("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      auth.setUser((prev) => ({
        ...prev,
        profile_picture_url: response.url || "",
        isAuthenticated: true,
      }));
      alert.success({ title: "Profile Picture Updated", description: "Image uploaded successfully." });
    } catch (err) {
      setUploadStatus("");
      let errorMessage = "Image upload failed.";
      try {
        const errorMatch = err.message.match(/Error fetching: (.+)/);
        if (errorMatch) {
          const errorText = errorMatch[1];
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        }
      } catch (parseError) {
      }
      alert.error({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
    }
  }

  async function handleDeletePicture() {
    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/picture`, {
        method: "DELETE",
      });
      setProfilePictureUrl("");
      setSelectedFile(null);
      setUploadStatus("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      auth.setUser((prev) => ({
        ...prev,
        profile_picture_url: ""
      }));
      alert.success({ title: "Picture Deleted", description: "Profile picture removed." });
    } catch (err) {
      let errorMessage = "Could not delete profile picture.";
      try {
        const errorMatch = err.message.match(/Error fetching: (.+)/);
        if (errorMatch) {
          const errorText = errorMatch[1];
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        }
      } catch (parseError) {}
      alert.error({ title: "Delete Failed", description: errorMessage, variant: "destructive" });
    }
  }

  return {
    selectedFile,
    setSelectedFile,
    uploadStatus,
    setUploadStatus,
    fileInputRef,
    handleProfilePictureChange,
    handleProfilePictureUpload,
    handleDeletePicture,
  };
} 