import { Outlet } from "react-router-dom";
import Footer from "../blog/components/Footer";
import CookieBanner from "../blog/components/CookieBanner";
export default function DefaultLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
