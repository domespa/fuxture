import { Link } from "react-router-dom";
import { Linkedin, Mail } from "lucide-react";
import NewsletterForm from "./Newsletterform";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Newsletter Section */}
      <div className="bg-gray-800 py-8 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-3">
              📬 Iscriviti alla Newsletter
            </h3>
            <p className="text-gray-400">
              Ricevi i migliori articoli direttamente nella tua inbox
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="py-12 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Chi Sono</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Benvenuto sul mio blog! Qui condivido pensieri, guide e
              riflessioni su gnammete. Seguimi per rimanere aggiornato!
            </p>
          </div>
          {/* Quick Links Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Link Utili</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="hover:text-blue-400 transition-colors"
                >
                  Chi Sono
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-blue-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/categorie"
                  className="hover:text-blue-400 transition-colors"
                >
                  Categorie
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-blue-400 transition-colors"
                >
                  Contatti
                </Link>
              </li>
            </ul>
          </div>
          {/* Legal Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Legale</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/cookie-policy"
                  className="hover:text-blue-400 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-blue-400 transition-colors"
                >
                  Termini di Servizio
                </Link>
              </li>
            </ul>
          </div>
          {/* Social Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Seguimi</h4>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com/in/tuoprofilo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
            <div className="mt-4">
              <a
                href="mailto:tuaemail@example.com"
                className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                <Mail size={16} />
                tuaemail@example.com
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-6 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {currentYear} Nome Blog. Tutti i diritti riservati.</p>
          <p className="mt-2 md:mt-0">
            P.IVA: 01234567890 | Powered by React & TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
}
