import {useContext} from "react";
import {UserContext} from "@/provider/UserContext.js";

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
        </div>
    )
}