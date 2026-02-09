import { useLocation } from "wouter";
import { BookOpen, LayoutDashboard } from "lucide-react";

/**
 * Navbar — persistent top navigation bar across all pages.
 */
export default function Navbar() {
  const [location, setLocation] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/docs", label: "Docs", icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 hidden sm:inline">
              Dashboard Builder
            </span>
          </button>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = link.href === "/"
                ? location === "/"
                : location.startsWith(link.href);

              return (
                <button
                  key={link.href}
                  onClick={() => setLocation(link.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
