import { Link, useLocation } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Settings,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProps, MenuItem } from "../../types/layout.types";

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Posts", path: "/dashboard/posts", icon: FileText },
  { name: "Comments", path: "/dashboard/comments", icon: MessageSquare },
  { name: "Campaigns", path: "/dashboard/campaigns", icon: Mail },
  { name: "Users", path: "/dashboard/users", icon: Users },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  // FUNZIONE PER CHIUDERE LA SIDEBAR SU MOBILE
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };
  return (
    <>
      {/* Overlay (solo mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white
          transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header con Logo e Close Button */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold">AAA</span>
          </div>

          {/* Close button (solo mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium
                  transition-colors duration-200
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
