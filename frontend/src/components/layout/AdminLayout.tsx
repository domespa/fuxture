import { useNavigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { NavbarUser } from "../../types/layout.types";
import { commentsAPI } from "../../services/api";
import { useEffect, useState } from "react";
import { CommentStatus } from "../../../../backend/src/types/comment.types";

// TIPO PAYPLOAD
interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
  role: "ADMIN" | "USER";
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<NavbarUser | null>(null);
  const [pendingCommentsCount, setPendingCommentsCount] = useState(0);

  // TOGGLE SIDEBAR
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // CHIUDIAMOLA PER MOBILE
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // VERIFICHIAMO TOKEN
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        // DECODIFICA JWT
        const decoded = jwtDecode<JWTPayload>(token);

        // VERIFICHIAMO SE SCADUTO
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        // SE NON è SCADUTO
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
          });
        } else {
          // FALLBACK
          setUser({
            firstName: "User",
            lastName: "",
            email: decoded.email,
            role: decoded.role,
          });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  // FETCH COMMENTI
  useEffect(() => {
    const fetchPendingComments = async () => {
      try {
        const count = await commentsAPI.getCommentsCount(CommentStatus.PENDING);
        setPendingCommentsCount(count);
      } catch (error) {
        console.error("Error fetching pending comments:", error);
      }
    };

    if (user) {
      fetchPendingComments;

      // POLLING PER AGGIIORNARE IL BADGE OGNI 5 MINUTI
      const interval = setInterval(fetchPendingComments, 500000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // LOADING MENTRE VERIFICHIAMO IL TOKEN
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          toggleSidebar={toggleSidebar}
          user={user}
          pendingCommentsCount={pendingCommentsCount}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
