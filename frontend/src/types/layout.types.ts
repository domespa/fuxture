// INFO UTENTE PER NAVBAR
export interface NavbarUser {
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "USER";
}

export interface NavbarProps {
  toggleSidebar: () => void;
  user: NavbarUser;
  pendingCommentsCount: number;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

// SIDEBAR
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
