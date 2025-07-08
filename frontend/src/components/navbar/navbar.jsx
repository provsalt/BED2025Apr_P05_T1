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
import { User } from "lucide-react";

export const Navbar = () => {
    return (
        <div className="p-3.5 flex justify-between">
            <Link className="font-bold " to="/">
                Eldercare
            </Link>
            <div className="flex">
                <Button asChild={true}>
                    <Link to={"/login"}>Login</Link>
                </Button>
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
