import {Link} from "react-router";
import {Button} from "@/components/ui/button.jsx";

export const Navbar = () => {
  return (
    <div className="p-3.5 flex justify-between items-center bg-white shadow sticky top-0 z-10">
      <Link className="font-bold text-purple-700 text-xl" to="/">
        Eldercare
      </Link>
      <div className="flex space-x-4 text-sm sm:text-base">
        <Link to="/">Home</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/community">Community Events</Link>
        <Link to="/medical">Medical</Link>
        <Link to="/nutrition">Nutrition</Link>
        <Link to="/transport">Transport</Link>
        <Link to="/profile">User Profile</Link>
        <Link to="/settings">User Settings</Link>
        <Button asChild={true}>
          <Link to="/login">Login</Link>
        </Button>
      </div>
    </div>
  );
};
