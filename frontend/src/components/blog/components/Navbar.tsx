import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600";
  };

  return (
    <nav>
      <ul className="flex gap-4 md:gap-8 text-sm md:text-base">
        <li>
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/contact" className={isActive("/contact")}>
            Contatti
          </Link>
        </li>
      </ul>
    </nav>
  );
}
