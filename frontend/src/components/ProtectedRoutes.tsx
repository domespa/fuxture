import { Navigate } from "react-router-dom";

interface ProtectedRouterProps {
  children: React.ReactNode;
}

export default function ProtectedRouter({ children }: ProtectedRouterProps) {
  const token = localStorage.getItem("token");

  // SE NON C'è FAI IL REDIRECT AL LOGIN
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
