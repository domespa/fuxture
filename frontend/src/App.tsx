import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import AdminLayout from "./components/layout/AdminLayout";
import Posts from "./pages/dashboard/Posts";
import { CreatePost } from "./components/editor/CreatePost";
import { EditPost } from "./components/editor/EditPost";
import Comments from "./pages/dashboard/Comments";
import Campaigns from "./pages/dashboard/Campaigns";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
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
          <Route path="posts" element={<Posts />} />
          <Route path="posts/create" element={<CreatePost />} />
          <Route path="posts/edit/:id" element={<EditPost />} />
          <Route path="comments" element={<Comments />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route
            path="campaigns/create"
            element={<div>Create Campaign (TODO)</div>}
          />
          <Route
            path="campaigns/edit/:id"
            element={<div>Edit Campaign (TODO)</div>}
          />
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
