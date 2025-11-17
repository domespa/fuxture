import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import AdminLayout from "./components/layout/AdminLayout";
import DefaultLayout from "./components/layout/DefaultLayout";
import Posts from "./pages/admin/dashboard/Posts";
import { CreatePost } from "./components/editor/CreatePost";
import { EditPost } from "./components/editor/EditPost";
import Comments from "./pages/admin/dashboard/Comments";
import Campaigns from "./pages/admin/dashboard/Campaigns";
import CreateCampaing from "./pages/admin/dashboard/CreateCampaign";
import { EditCampaign } from "./pages/admin/dashboard/EditCampaign";
import { SendPreview } from "./components/campaigns/SendPreview";
import EmailListsPage from "@/pages/admin/dashboard/EmailLists";
import UsersPage from "./pages/admin/dashboard/UserPage";

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
        <Route path="/" element={<DefaultLayout />} />

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
          <Route path="campaigns/create" element={<CreateCampaing />} />
          <Route path="campaigns/edit/:id" element={<EditCampaign />} />
          <Route
            path="/dashboard/campaigns/send-preview"
            element={<SendPreview />}
          />
          <Route path="email-lists" element={<EmailListsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<div>Settings Page (TODO)</div>} />
        </Route>

        {/* 404 - Pagina non trovata */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
