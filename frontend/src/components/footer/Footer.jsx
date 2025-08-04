import { Link } from "react-router";

export const Footer = () => {
  const sitemapLinks = [
    { to: "/", label: "Home" },
    { to: "/chats", label: "Chat" },
    { to: "/community", label: "Community" },
    { to: "/medical", label: "Medical" },
    { to: "/nutrition", label: "Nutrition" },
    { to: "/transport", label: "Transport" }
  ];

  return (
    <footer className="bg-secondary border-t border-border mt-auto">
      <div className="flex flex-col gap-6 p-4 px-8 md:px-16">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Quick links</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {sitemapLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm border-b-2 border-primary text-secondary-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/credits"
              className="text-sm border-b-2 border-primary text-secondary-foreground hover:text-foreground transition-colors"
            >
              Credits
            </Link>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-border">
          <div className="text-sm text-secondary-foreground">
            © 2025 ElderCare. All rights reserved.
          </div>
          <div className="text-sm text-secondary-foreground">
            Built with React & Express
          </div>
        </div>
      </div>
    </footer>
  );
}