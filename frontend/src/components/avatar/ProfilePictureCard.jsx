import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { User } from "lucide-react";

export function ProfilePictureCard({
  profilePictureUrl,
  selectedFile,
  uploadStatus,
  fileInputRef,
  handleProfilePictureChange,
  handleProfilePictureUpload,
  handleDeletePicture,
}) {
  return (
    <Card className="w-[260px] mx-auto" style={{ minHeight: 420, maxHeight: 420 }}>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="text-xs text-gray-500 text-center mb-2">
          Supported formats: JPEG, JPG, PNG, WEBP (max 8MB)
        </div>
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
        ) : (
        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <User className="w-16 h-16" />
        </div>
        )}
        <label
          htmlFor="profile-picture-upload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors w-[220px] mx-auto"
          style={{ width: 220, height: 60, minHeight: 60, maxHeight: 60, boxSizing: "border-box" }}
        >
          <span
            className="text-gray-500 text-base w-full text-center"
            style={{
              display: "block",
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              margin: "0 auto"
            }}
            title={selectedFile ? selectedFile.name : ""}
          >
            {selectedFile ? (
              <>
                {selectedFile.name.length > 30
                  ? selectedFile.name.slice(0, 15) + "..." + selectedFile.name.slice(-10)
                  : selectedFile.name}
                {` (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`}
              </>
            ) : (
              <>Add image here or click to select</>
            )}
          </span>
          <Input
            ref={fileInputRef}
            id="profile-picture-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
        </label>
        {uploadStatus && uploadStatus !== "Uploading..." && !selectedFile && (
          <div className="text-sm text-gray-600 text-center">{uploadStatus}</div>
        )}
        <div className="flex gap-2">
          <Button
            onClick={handleProfilePictureUpload}
            size="sm"
            disabled={!selectedFile || uploadStatus === "Uploading..."}
          >
            {uploadStatus === "Uploading..." ? "Uploading..." : "Upload"}
          </Button>
          <Button variant="destructive" onClick={handleDeletePicture} size="sm">Delete</Button>
        </div>
      </CardContent>
    </Card>
  );
} 