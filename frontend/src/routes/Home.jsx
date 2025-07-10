import {useContext} from "react";
import {UserContext} from "@/provider/UserContext.js";
import AnnouncementsList from "@/components/AnnouncementsList.jsx";

export const Home = () => {
  const auth = useContext(UserContext);
    return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to Eldercare</h1>
            <p className="text-gray-600">
              {auth.id ? `Hello, User ${auth.id}` : "Please log in to access all features"}
            </p>
          </div>
          
          {/* Show announcements to all users */}
          <div className="mb-8">
            <AnnouncementsList 
              isAdmin={false}
              // Use public endpoint for all users
            />
          </div>
        </div>
    )
}