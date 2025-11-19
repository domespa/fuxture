import { Menu, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavbarProps } from "@/types/layout.types";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({
  toggleSidebar,
  user,
  pendingCommentsCount,
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // USIAMO USEFFECT PER CHIUDERE DROPDOWN SE CLICK FUORI DAL MENU
  useEffect(() => {
    const handleClickOut = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOut);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOut);
    };
  }, [isDropdownOpen]);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // REDIRECT
  const handleBellClick = () => {
    navigate("/dashboard/comments");
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* LEFT SIDE: Hamburger + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <h1 className="text-xl font-bold text-gray-800">Pannelo Admin</h1>
        </div>

        {/* RIGHT SIDE: Notifications + User Dropdown */}
        <div className="flex items-center gap-2">
          {/* Notifications Badge */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleBellClick}
            title={
              pendingCommentsCount > 0
                ? `${pendingCommentsCount} commenti in attesa`
                : "Nessun commento in attesa"
            }
          >
            <Bell className="h-5 w-5" />
            {pendingCommentsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
                {pendingCommentsCount}
              </span>
            )}
          </Button>

          {/* User Dropdown */}
          <div ref={dropdownRef} className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <User className="h-5 w-5" />
              <span className="hidden md:inline">{user.firstName}</span>
            </Button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    {user.role}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
