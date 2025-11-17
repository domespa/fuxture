import Navbar from "./Navbar";
import Logo from "./Logo";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 py-4 px-8 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>
        <Navbar />
      </div>
    </header>
  );
}
