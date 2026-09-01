import { Link, useLocation } from "react-router-dom";
import { Gamepad2, Mail, TrendingUp } from "lucide-react";

// ====================================================================================================== //
//        Header unico del sito pubblico: montato una volta sola in DefaultLayout.
//        Nasce dalla topbar della home, che era l unica con logo e nome del brand.
//        ALTEZZA 52px: se cambia, aggiornare anche le pagine che usano calc(100vh - 52px).
// ====================================================================================================== //
const NAV_ITEMS = [
  { to: "/posts", label: "Articoli", Icon: TrendingUp },
  { to: "/games", label: "Giochi", Icon: Gamepad2 },
  { to: "/contact", label: "Contatti", Icon: Mail },
];

export default function SiteHeader() {
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__brand">
          <img src="/logo.png" alt="Fuxture" className="site-header__logo" />
          <span className="site-header__name">Fuxture</span>
        </Link>

        <nav className="site-header__nav">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={`site-header__link${
                isActive(to) ? " site-header__link--active" : ""
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <style>{`
        .site-header {
          background: #0B1120;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 40;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .site-header__inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .site-header__brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .site-header__logo {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }
        .site-header__name {
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .site-header__nav { display: flex; gap: 4px; }
        .site-header__link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .site-header__link:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .site-header__link--active {
          color: #fff;
          background: rgba(255,255,255,0.1);
        }

        @media (max-width: 640px) {
          .site-header__name { display: none; }
          .site-header__inner { padding: 0 16px; }
          .site-header__link { padding: 6px 10px; }
        }
      `}</style>
    </div>
  );
}
