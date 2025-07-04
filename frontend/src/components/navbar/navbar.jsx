import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "@/provider/UserContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

export const Navbar = () => {
  const {
    isAuthenticated,
    profile_picture_url,
    setUser,
  } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser({ id: null, token: null, isAuthenticated: false });
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleAvatarClick = () => {
    if (!isAuthenticated) navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 shadow-md bg-white">
      <div className="text-xl font-bold text-black">
        <Link to="/">ElderCare</Link>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link to="/medical">Medical</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/chats">Chat</Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div onClick={handleAvatarClick} className="cursor-pointer w-10 h-10">
              {isAuthenticated && profile_picture_url ? (
                <img
                  src={profile_picture_url}
                  alt="Profile"
                  className="rounded-full w-10 h-10 object-cover"
                />
                ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          </DropdownMenuTrigger>

          {isAuthenticated && (
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </nav>
  );
};
