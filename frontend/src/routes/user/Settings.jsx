import { useEffect, useState, useContext } from "react";
import { Button } from "@/components/ui/button.jsx";
import { UserContext } from "@/provider/UserContext.js";
import { useAlert } from "@/provider/AlertProvider.jsx";
import { useLocation, useNavigate } from "react-router";
import { fetcher } from "@/lib/fetcher.js";
import { useForm } from "react-hook-form";
import { LoginHistory } from "@/components/settings/LoginHistory";
import { useProfilePicture } from "@/hooks/useProfilePicture.js";
import { ProfilePictureCard } from "@/components/avatar/ProfilePictureCard.jsx";
import ProfileSection from "@/components/settings/ProfileSection.jsx";
import PasswordSection from "@/components/settings/PasswordSection.jsx";
import DeletionRequestSection from "@/components/settings/DeletionRequestSection.jsx";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";

export function Settings() {
  const auth = useContext(UserContext);
  const alert = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm();

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [userId, setUserId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasRequestedDeletion, setHasRequestedDeletion] = useState(false);

  const profilePicture = useProfilePicture({
    auth,
    setProfilePictureUrl,
    alert,
  });

  useEffect(() => {
    if (!auth) return;

    fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`)
      .then((user) => {
        setValue("name", user.name || "");
        setValue("email", user.email || "");
        setValue("date_of_birth", user.date_of_birth?.split("T")[0] || "");
        setValue("gender", user.gender === "0" ? "female" : user.gender === "1" ? "male" : "");
        setValue("language", user.language || "");
        setProfilePictureUrl(user.profile_picture_url || "");
        setUserId(user.id);
        setHasRequestedDeletion(!!user.deletionRequested);
      })
      .catch(() => {
        alert.error({ title: "Error", description: "Failed to load user info." });
      });
  }, [auth, setValue]);

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onProfileSubmit(data) {
    if (!userId) return;

    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: data.name,
          gender: data.gender === "female" ? "0" : data.gender === "male" ? "1" : null,
          date_of_birth: data.date_of_birth,
          language: data.language
        })
      });

      alert.success({ title: "Profile Updated", description: "Your profile was saved successfully." });
      setEditMode(false);
    } catch (err) {
      alert.error({ title: "Update Failed", description: "Could not update your profile." });
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      alert.error({ title: "Password Mismatch", description: "New passwords do not match." });
      return;
    }

    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      alert.success({ title: "Password Updated", description: "Your password was changed successfully." });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      let errorMessage = "Password update failed.";
      
      try {
        const errorMatch = err.message.match(/Error fetching: (.+)/);
        if (errorMatch) {
          const errorText = errorMatch[1];
          const errorData = JSON.parse(errorText);
          
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        }
      } catch (parseError) {
        errorMessage = "Password update failed. Please try again.";
      }
      alert.error({ title: "Password Update Failed", description: errorMessage });
    }
  }

  async function handleRequestAccountDeletion() {
    setShowDeleteConfirm(false);
    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/request-delete`, {
        method: "POST"
      });
      alert.success({ title: "Request Submitted", description: "Your account deletion request has been sent for admin approval." });
      setHasRequestedDeletion(true);
    } catch (err) {
      alert.error({ title: "Request Failed", description: "Could not submit deletion request." });
    }
  }

  async function handleCancelAccountDeletion() {
    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/cancel-delete`, {
        method: "POST"
      });
      alert.success({ title: "Request Cancelled", description: "Your account deletion request has been cancelled." });
      setHasRequestedDeletion(false);
    } catch (err) {
      alert.error({ title: "Cancel Failed", description: "Could not cancel deletion request." });
    }
  }

  useEffect(() => {
    return () => {
      if (auth.refreshUser) auth.refreshUser();
    };
  }, [location.pathname]);

  if (!auth.token) return null;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <PageContainer className="max-w-4xl">
        <PageHeader
          breadcrumbs={[{ label: "Settings" }]}
          title="Profile Settings"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ProfilePictureCard
              profilePictureUrl={profilePictureUrl}
              selectedFile={profilePicture.selectedFile}
              uploadStatus={profilePicture.uploadStatus}
              fileInputRef={profilePicture.fileInputRef}
              handleProfilePictureChange={profilePicture.handleProfilePictureChange}
              handleProfilePictureUpload={profilePicture.handleProfilePictureUpload}
              handleDeletePicture={profilePicture.handleDeletePicture}
            />
          </div>

          <div className="md:col-span-2">
            <ProfileSection
              editMode={editMode}
              errors={errors}
              register={register}
              control={control}
              handleSubmit={handleSubmit}
              onProfileSubmit={onProfileSubmit}
              setEditMode={setEditMode}
            />
          </div>

          <div className="md:col-span-3">
            <PasswordSection
              passwordForm={passwordForm}
              handlePasswordChange={handlePasswordChange}
              handleChangePassword={handleChangePassword}
            />
          </div>

          <div className="md:col-span-3">
            <DeletionRequestSection
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
              handleRequestAccountDeletion={handleRequestAccountDeletion}
              hasRequestedDeletion={hasRequestedDeletion}
              handleCancelAccountDeletion={handleCancelAccountDeletion}
            />
          </div>

          <div className="md:col-span-3 flex justify-center space-x-4">
            <Button variant="destructive" onClick={() => {
              auth.setUser({ id: null, token: null, isAuthenticated: false });
              localStorage.removeItem("token");
              navigate("/");
            }}>
              Logout
            </Button>
          </div>
        </div>
        <div className="mt-8">
          <LoginHistory />
        </div>
      </PageContainer>
    </div>
  );
}
