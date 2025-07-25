import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export const Landing = (props) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-28">
      <h1 className="text-5xl font-extrabold text-purple-800">Welcome to ElderCare</h1>
      <p className="text-gray-600 max-w-xl text-lg">
        Supporting seniors with medical reminders, nutrition tracking, transport planning, and community events.
      </p>
      <div className="space-x-6 flex items-center">
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button variant="link" asChild>
          <Link to="/signUp">Create an Account</Link>
        </Button>
      </div>
    </div>
  );
}
