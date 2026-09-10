import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouterProps {
  children: React.ReactNode;
}

interface JWTPayload {
  exp?: number;
  role?: string;
}

// Il controllo vero sta sul server, che verifica la firma a ogni richiesta:
// qui si evita solo di far entrare in una schermata che poi si riempirebbe
// di errori 401. Prima bastava una qualunque stringa sotto la chiave "token"
// per superare il varco, e un token scaduto - o di un utente senza ruolo
// ADMIN - portava dentro un pannello che poi non caricava nulla.
export default function ProtectedRouter({ children }: ProtectedRouterProps) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<JWTPayload>(token);

    const isExpired = !decoded.exp || decoded.exp < Date.now() / 1000;

    if (isExpired || decoded.role !== "ADMIN") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }
  } catch {
    // Token illeggibile: vale quanto non averlo.
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
