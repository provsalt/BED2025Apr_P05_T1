import { Link, useNavigate } from "react-router";
import { useContext, useState } from "react";
import { UserContext } from "@/provider/UserContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Navbar = () => {
  const { isAuthenticated, role, data, setUser } = useContext(UserContext);
  const profile_picture_url = data?.profile_picture_url;
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser({ id: null, token: null, isAuthenticated: false });
    localStorage.removeItem("token");
    navigate("/");
  };

  const links = [
    { to: "/chats", label: "Chat" },
    { to: "/community", label: "Community" },
    { to: "/medical", label: "Medical" },
    { to: "/nutrition", label: "Nutrition" },
    { to: "/transport", label: "Transport" }
  ];

  const navLinkClasses = "text-base font-semibold text-foreground hover:text-primary transition-colors";

  return (
    <nav className="relative shadow-sm bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div className="text-xl font-bold text-foreground">
          <Link to="/">ElderCare</Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={navLinkClasses}
              >
                {link.label}
              </Link>
            ))
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative w-10 h-10 cursor-pointer rounded-full ring-2 ring-transparent hover:ring-primary transition-all">
                  {profile_picture_url ? (
                    <img
                      src={profile_picture_url}
                      alt="Profile"
                      className="rounded-full w-10 h-10 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg p-2">
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>

                {role === "Admin" && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleLogout} asChild>
                  <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative w-9 h-9 cursor-pointer rounded-full">
                  {profile_picture_url ? (
                    <img
                      src={profile_picture_url}
                      alt="Profile"
                      className="rounded-full w-9 h-9 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg p-2">
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>

                {role === "Admin" && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleLogout} asChild>
                  <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md cursor-pointer">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden border-t border-border bg-card overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {isAuthenticated ? (
                links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                <div className="flex flex-col gap-2 py-2">
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
