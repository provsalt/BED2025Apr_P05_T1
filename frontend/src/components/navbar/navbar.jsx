import { Link, useNavigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "@/provider/UserContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";

import "@/components/ui/profileRing.css";

export const Navbar = () => {
  const { isAuthenticated, data, setUser } = useContext(UserContext);
  const profile_picture_url = data?.profile_picture_url;
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
    <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-white">
      <div className="text-2xl font-bold text-black">
        <Link to="/">ElderCare</Link>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="text-base font-semibold text-black hover:bg-purple-100 rounded-md transition">
          <Link to="/" className="text-base font-semibold text-black relative after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-purple-600 after:transition-all after:duration-300 hover:after:w-full"
          >Home</Link>
        </Button>
        <Button variant="ghost" asChild className="text-base font-semibold text-black hover:bg-purple-100 rounded-md transition">
          <Link to="/chats" className="text-base font-semibold text-black relative after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-purple-600 after:transition-all after:duration-300 hover:after:w-full"
          >Chat</Link>
        </Button>
        <Button variant="ghost" asChild className="text-base font-semibold text-black hover:bg-purple-100 rounded-md transition">
          <Link to="/community" className="text-base font-semibold text-black relative after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-purple-600 after:transition-all after:duration-300 hover:after:w-full"
          >Community Events</Link>
        </Button>
        <Button variant="ghost" asChild className="text-base font-semibold text-black hover:bg-purple-100 rounded-md transition">
          <Link to="/medical" className="text-base font-semibold text-black relative after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-purple-600 after:transition-all after:duration-300 hover:after:w-full"
          >Medical</Link>
        </Button>
        <Button variant="ghost" asChild className="text-base font-semibold text-black hover:bg-purple-100 rounded-md transition">
          <Link to="/nutrition" className="text-base font-semibold text-black relative after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-purple-600 after:transition-all after:duration-300 hover:after:w-full"
          >Nutrition</Link>
        </Button>
        <Button variant="ghost" asChild className="text-base font-semibold text-black hover:bg-purple-100 rounded-md transition">
          <Link to="/transport" className="text-base font-semibold text-black relative after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-purple-600 after:transition-all after:duration-300 hover:after:w-full"
          >Transport</Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              onClick={handleAvatarClick}
              className="relative w-10 h-10 profile-hover-ring cursor-pointer"
            >
              {isAuthenticated && profile_picture_url ? (
                <img
                  src={profile_picture_url}
                  alt="Profile"
                  className="rounded-full w-10 h-10 object-cover z-10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 z-10">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          </DropdownMenuTrigger>

          {isAuthenticated && (
          <DropdownMenuContent
            align="end"
            className="w-52 rounded-xl bg-white shadow-lg border border-gray-200 p-2"
          >
            <DropdownMenuItem asChild>
              <Link
                to="/settings"
                className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-800 rounded-md hover:bg-gray-100 transition"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-purple-600 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                  Settings
                </span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleLogout} asChild>
              <div className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-800 rounded-md hover:bg-gray-100 cursor-pointer transition">
                <LogOut className="w-5 h-5 text-gray-600" />
                <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-purple-600 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                  Logout
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </nav>
  );
};
