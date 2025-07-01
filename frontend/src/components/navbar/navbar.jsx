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
import { Button } from "@/components/ui/button.jsx";
import { useContext } from "react";
import { UserContext } from "@/provider/UserContext.js";

export const Navbar = () => {
  const { id, isAuthenticated, setUser } = useContext(UserContext);

  const handleLogout = () => {
    setUser({ id: null, token: null, isAuthenticated: false });
    localStorage.removeItem("token");
  };

  return (
    <div className="p-3.5 flex justify-between">
      <Link className="font-bold" to="/">
        Eldercare
      </Link>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm">Logged in as: User {id}</span>
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
};
