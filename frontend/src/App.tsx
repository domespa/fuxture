import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import AdminLayout from "./components/layout/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Route pubbliche */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Route protette */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested routes */}
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<div>Posts Page (TODO)</div>} />
          <Route path="comments" element={<div>Comments Page (TODO)</div>} />
          <Route path="users" element={<div>Users Page (TODO)</div>} />
          <Route path="settings" element={<div>Settings Page (TODO)</div>} />
        </Route>

        {/* 404 - Pagina non trovata */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
