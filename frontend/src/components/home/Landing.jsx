import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "@/provider/UserContext.js";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export const Landing = (props) => {
  const navigate = useNavigate();
  const auth = useContext(UserContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      auth.setUser({
        id: payload.sub,
        token,
        isAuthenticated: true,
        role: payload.role,
        data: {}
      });
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate(payload.role === "Admin" ? "/admin/dashboard" : "/");
    }
  }, [auth, navigate]);

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
