import {Link} from "react-router";
import {Button} from "@/components/ui/button.jsx";

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
        </div>
    )
}