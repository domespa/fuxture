import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoutes";
import AdminLayout from "./components/layout/AdminLayout";
import DefaultLayout from "./components/layout/DefaultLayout";
import TestNewsPage from "./pages/test/TestNewsPage";
import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import PostDetailPage from "./pages/PostDetailPage";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import CookiePolicy from "./pages/legal/CookiePolicy";
import Terms from "./pages/legal/Terms";
import ScrollToTop from "./components/blog/components/ScrollToTop";
import ContactPage from "./pages/ContactPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import PreferencesPage from "./pages/PreferencesPage";

const Dashboard = lazy(() => import("./pages/admin/dashboard/Dashboard"));
const Posts = lazy(() => import("./pages/admin/dashboard/Posts"));
const Comments = lazy(() => import("./pages/admin/dashboard/Comments"));
const Campaigns = lazy(() => import("./pages/admin/dashboard/Campaigns"));
const SendHistory = lazy(() => import("./pages/admin/dashboard/SendHistory"));
const CreateCampaing = lazy(
  () => import("./pages/admin/dashboard/CreateCampaign"),
);
const EmailListsPage = lazy(() => import("@/pages/admin/dashboard/EmailLists"));
const UsersPage = lazy(() => import("./pages/admin/dashboard/UserPage"));
const CategoriesPage = lazy(
  () => import("./pages/admin/dashboard/CategoriesPage"),
);
const GamesPage = lazy(() => import("./pages/GamesPage"));
const GameDetailPage = lazy(() => import("./pages/GameDetailPage"));
const AdminGamesPage = lazy(() => import("./pages/admin/dashboard/GamesPage"));
const CreatePost = lazy(() =>
  import("./components/editor/CreatePost").then(
    ({ CreatePost: Component }) => ({ default: Component }),
  ),
);
const EditPost = lazy(() =>
  import("./components/editor/EditPost").then(({ EditPost: Component }) => ({
    default: Component,
  })),
);
const EditCampaign = lazy(() =>
  import("./pages/admin/dashboard/EditCampaign").then(
    ({ EditCampaign: Component }) => ({ default: Component }),
  ),
);
const SendPreview = lazy(() =>
  import("./components/campaigns/SendPreview").then(
    ({ SendPreview: Component }) => ({ default: Component }),
  ),
);

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
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            Caricamento...
          </div>
        }
      >
        <Routes>
          {/* Route pubbliche */}
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<HomePage />} />
            <Route path="posts" element={<BlogPage />} />
            <Route path="posts/:slug" element={<PostDetailPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="games/:slug" element={<GameDetailPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<Terms />} />
          </Route>
          <Route path="/login" element={<Login />} />
          {/* La registrazione pubblica e' chiusa: gli account amministrativi si
            creano a mano, e la rotta POST /auth/register non e' montata. */}
          <Route path="/test-news" element={<TestNewsPage />} />

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
            <Route path="/dashboard/categories" element={<CategoriesPage />} />
            <Route path="games" element={<AdminGamesPage />} />
            <Route path="comments" element={<Comments />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="email-logs" element={<SendHistory />} />
            <Route path="campaigns/create" element={<CreateCampaing />} />
            <Route path="campaigns/edit/:id" element={<EditCampaign />} />
            <Route
              path="/dashboard/campaigns/send-preview"
              element={<SendPreview />}
            />
            <Route path="email-lists" element={<EmailListsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route path="/unsubscribe" element={<UnsubscribePage />} />
          <Route path="/unsubscribe/:id" element={<UnsubscribePage />} />
          {/* Area preferenze: revoca granulare ex Linee Guida Garante 17/04/2026 */}
          <Route path="/preferenze/:id" element={<PreferencesPage />} />
          {/* 404 - Pagina non trovata.
            Portava al login: un visitatore che sbagliava a digitare un
            indirizzo, o che seguiva un link a un articolo cancellato, si
            ritrovava davanti alla schermata di accesso di un'area che non lo
            riguarda. Si torna in home. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
