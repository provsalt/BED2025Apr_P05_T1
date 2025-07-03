// import {Link} from "react-router";
// import {Button} from "@/components/ui/button.jsx";

// export const Navbar = () => {
//     return (
//         <div className="p-3.5 flex justify-between">
//             <Link className="font-bold " to="/">
//                 Eldercare
//             </Link>
//             <div className="flex">
//                 <Button asChild={true}>
//                     <Link to={"/login"}>Login</Link>
//                 </Button>
//             </div>
//         </div>
//     )
// }
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
  const { id, isAuthenticated, name, profile_picture_url, setUser } = useContext(UserContext);
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
      {/* Left: Logo */}
      <div className="text-xl font-bold text-black">
        <Link to="/">ElderCare</Link>
      </div>

      {/* Right: Navigation + Avatar */}
      <div className="flex items-center gap-4">
        {/* Always show Medical and Chat */}
        <Button variant="ghost" asChild>
          <Link to="/medical">Medical</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/chats">Chat</Link>
        </Button>

        {/* Avatar/Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div onClick={handleAvatarClick} className="cursor-pointer">
<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
  <User className="w-5 h-5" />
</div>


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

