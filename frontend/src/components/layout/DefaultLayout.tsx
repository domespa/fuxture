import { Outlet } from "react-router-dom";
import Footer from "../blog/components/Footer";
import CookieBanner from "../blog/components/CookieBanner";
import SiteHeader from "./SiteHeader";

export default function DefaultLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
