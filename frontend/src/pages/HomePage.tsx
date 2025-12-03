import { useEffect, useState } from "react";
import { categoriesAPI } from "@/services/api";
import type { Category } from "@/types/category.types";
import { Link } from "react-router-dom";
import { TrendingUp, BookOpen, Star, ChevronRight } from "lucide-react";
import NewsWidget from "@/components/blog/components/NewsWidget";
import BlogPostsSlider from "@/components/blog/components/BlogPostsSlider";
import BreakingNewsBar from "@/components/blog/components/BreakingNewsBar";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getCategories(false);
      setCategories(data);
    } catch (error) {
      console.error("Error nel fetch delle categorie", error);
    } finally {
      setIsLoading(false);
    }
  };

  const staticMenuItems = [
    { name: "Ultimi Articoli", slug: "/posts", icon: TrendingUp },
    { name: "Più Popolari", slug: "/posts?sort=popular", icon: Star },
    // { name: "Tutti gli Articoli", slug: "/posts/all", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <BreakingNewsBar />
      {/* HERO SECTION */}
      <div
        className="relative bg-cover bg-center bg-fixed overflow-hidden"
        style={{ backgroundImage: "url('/hero.png')" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom right, rgba(31, 41, 55, 0.95), rgba(29, 49, 94, 0.95), rgba(31, 41, 55, 0.90))",
          }}
        />

        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6 animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 md:w-40 md:h-40 transform hover:scale-105 transition-transform duration-300">
                  <img
                    className="rounded-full w-full h-full object-cover shadow-2xl ring-4 ring-white/20"
                    src="/logo.png"
                    alt="Fuxture Logo"
                  />
                </div>
              </div>
              <div
                className="h-1 w-32 mx-auto rounded-full"
                style={{
                  background: "linear-gradient(to right, #1D315E, #1F2937)",
                }}
              />
            </div>

            <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light">
              Informazione. Ispirazione. Innovazione.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-10 mb-12">
              {staticMenuItems.map((item, index) => (
                <Link
                  key={item.slug}
                  to={item.slug}
                  className="group relative bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-10"
                    style={{
                      background:
                        "linear-gradient(to bottom right, #1D315E, #1F2937)",
                    }}
                  />

                  <item.icon className="w-8 h-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-white font-semibold text-sm">
                    {item.name}
                  </p>

                  <ChevronRight className="w-5 h-5 text-white/50 absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F8FAFC"
            />
          </svg>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 mt-0 md:-mt-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* ULTIME NOTIZIE */}
          <div className="mb-16">
            <div className="text-center mb-10 pt-8 md:pt-0">
              <h2
                className="text-4xl font-bold mb-3"
                style={{ color: "#1F2937" }}
              >
                Ultime Notizie
              </h2>
              <p className="text-gray-600 text-lg">
                Rimani aggiornato con le news più recenti
              </p>
              <div
                className="h-1 w-150 mx-auto mt-4 rounded-full"
                style={{
                  background: "linear-gradient(to right, #1D315E, #1F2937)",
                }}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <BlogPostsSlider />
              <NewsWidget />
            </div>
          </div>

          {/* CATEGORIES SECTION */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2
                className="text-4xl font-bold mb-3"
                style={{ color: "#1F2937" }}
              >
                Esplora per Categoria
              </h2>
              <p className="text-gray-600 text-lg">
                Trova gli articoli che ti interessano di più
              </p>
              <div
                className="h-1 w-24 mx-auto mt-4 rounded-full"
                style={{
                  background: "linear-gradient(to right, #1D315E, #1F2937)",
                }}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="relative">
                  <div
                    className="w-16 h-16 border-4 rounded-full animate-spin"
                    style={{
                      borderColor: "#F8FAFC",
                      borderTopColor: "#1D315E",
                    }}
                  />
                  <p className="text-gray-600 mt-4 text-center">
                    Caricamento...
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    to={`/posts?category=${category.slug}`}
                    className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-10"
                      style={{
                        background:
                          "linear-gradient(to bottom right, #1D315E, #1F2937)",
                      }}
                    />

                    <div className="relative z-10">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background:
                            "linear-gradient(to bottom right, rgba(29, 49, 94, 0.1), rgba(31, 41, 55, 0.1))",
                        }}
                      >
                        <span
                          className="text-2xl font-bold"
                          style={{ color: "#1F2937" }}
                        >
                          {category.name.charAt(0)}
                        </span>
                      </div>

                      <h3
                        className="font-bold mb-2 transition-colors duration-300"
                        style={{ color: "#1F2937" }}
                      >
                        {category.name}
                      </h3>

                      <ChevronRight
                        className="w-5 h-5 text-gray-400 group-hover:translate-x-2 transition-all duration-300 absolute bottom-6 right-6"
                        style={{
                          color: "rgba(31, 41, 55, 0.4)",
                        }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* CTA SECTION */}
          <div
            className="rounded-3xl p-12 text-center shadow-2xl mb-16"
            style={{
              background: "linear-gradient(to right, #1D315E, #1F2937)",
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Non perderti nessun aggiornamento
            </h2>
            <p className="text-gray-200 text-lg mb-8 max-w-2xl mx-auto">
              Rimani sempre informato con le ultime notizie e gli articoli più
              interessanti
            </p>
            <Link
              to="/posts"
              className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
              style={{ color: "#1D315E" }}
            >
              Esplora tutti gli articoli
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
