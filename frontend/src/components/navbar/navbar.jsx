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
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "@/provider/UserContext";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const { id, isAuthenticated, name, setUser } = useContext(UserContext);

  const handleLogout = () => {
    setUser({ id: null, token: null, isAuthenticated: false });
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 shadow-md bg-white">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-black">ElderCare</Link>
        {isAuthenticated && (
          <span className="text-sm text-gray-700 whitespace-nowrap">
            Logged in as: User {id}{" "}
            <strong className="text-black">Welcome {name}</strong>
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="w-23 bg-gray-200 text-gray-800 hover:bg-gray-300">
          <Link to="/settings">Settings</Link>
        </Button>
        <Button variant="ghost" asChild className="w-23 bg-gray-200 text-gray-800 hover:bg-gray-300">
          <Link to="/chats">Chat</Link>
        </Button>
        <Button variant="ghost" asChild className="w-23 bg-gray-200 text-gray-800 hover:bg-gray-300">
          <Link to="/medical">Medical</Link>
        </Button>

        {isAuthenticated ? (<Button onClick={handleLogout} className="w-23">Logout</Button>) : 
            (<Button asChild className="w-28">  
              <Link to="/login">Login</Link>
            </Button>)
          }
      </div>
    </nav>
  );
};

































