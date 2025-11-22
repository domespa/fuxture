import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { postsAPI, categoriesAPI } from "@/services/api";
import type { PostResponse, PostFilters, PostStatus } from "@/types/post.types";
import type { Category } from "@/types/category.types";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Calendar,
  Eye,
  Clock,
  TrendingUp,
  Sparkles,
  X,
} from "lucide-react";

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const categoriesLoadedRef = useRef(false);
  const lastFetchParams = useRef<string>("");

  const selectedCategory = useMemo(
    () => searchParams.get("category") || "all",
    [searchParams]
  );

  const currentPage = useMemo(
    () => parseInt(searchParams.get("page") || "1"),
    [searchParams]
  );

  const searchTerm = useMemo(
    () => searchParams.get("search") || "",
    [searchParams]
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesAPI.getCategories(false);
        setCategories(data);
        categoriesLoadedRef.current = true;
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    setSearchQuery(searchTerm);
  }, [searchTerm]);

  const fetchPosts = useCallback(async () => {
    if (!categoriesLoadedRef.current) return;
    const currentParams = `${selectedCategory}-${currentPage}-${searchTerm}`;
    if (lastFetchParams.current === currentParams) {
      return;
    }

    try {
      setIsLoading(true);
      const filters: PostFilters = {
        status: "PUBLISHED" as PostStatus,
        page: currentPage.toString(),
        limit: "12",
        sortBy: "publishedAt",
        sortOrder: "desc",
      };

      if (selectedCategory !== "all") {
        const category = categories.find(
          (cat) => cat.slug === selectedCategory
        );
        if (category) {
          filters.categoryId = category.id;
        }
      }

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      const response = await postsAPI.getPosts(filters);
      const postsData = "posts" in response ? response.posts : response;
      const paginationData =
        "pagination" in response ? response.pagination : null;

      setPosts(postsData);
      if (paginationData) {
        setPagination(paginationData);
      }

      lastFetchParams.current = currentParams;
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, currentPage, searchTerm, categories]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value.trim()) {
            newParams.set("search", value.trim());
          } else {
            newParams.delete("search");
          }
          newParams.set("page", "1");
          return newParams;
        });
      }, 500);
    },
    [setSearchParams]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("search");
      newParams.set("page", "1");
      return newParams;
    });
  }, [setSearchParams]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleCategoryChange = useCallback(
    (categorySlug: string) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("category", categorySlug);
        newParams.set("page", "1");
        return newParams;
      });
    },
    [setSearchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("page", page.toString());
        return newParams;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams]
  );

  const calculateReadTime = useCallback((content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, []);

  const handleInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.boxShadow = "0 0 0 3px rgba(29, 49, 94, 0.3)";
    },
    []
  );

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)";
    },
    []
  );

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      {/* HEADER SECTION */}
      <div
        className="py-16 relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom right, #1F2937, #1D315E)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center">
              {/* <div className="w-32 h-32 md:w-30 md:h-30 transform hover:scale-105 transition-transform duration-300">
                <img
                  className="rounded-full w-full h-full object-cover shadow-2xl ring-4 ring-white/20"
                  src="/logo.png"
                  alt="Fuxture Logo"
                />
              </div> */}
            </div>
            {/* <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light">
              Articoli, guide e approfondimenti sul mondo che ci circonda
            </p> */}

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cerca articoli..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full pl-12 pr-12 py-4 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-900 transition-shadow"
                style={{
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cancella ricerca"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {searchTerm && (
              <p className="text-white/80 mt-4 text-sm">
                {isLoading ? (
                  "Ricerca in corso..."
                ) : (
                  <>
                    Risultati per:{" "}
                    <span className="font-semibold">"{searchTerm}"</span> (
                    {pagination.total}{" "}
                    {pagination.total === 1 ? "articolo" : "articoli"})
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORIES NAVBAR */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("all")}
              disabled={isLoading}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedCategory === "all"
                  ? "text-white shadow-lg"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
              style={
                selectedCategory === "all" ? { backgroundColor: "#1D315E" } : {}
              }
            >
              Tutti gli articoli
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                disabled={isLoading}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedCategory === category.slug
                    ? "text-white shadow-lg"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
                style={
                  selectedCategory === category.slug
                    ? { backgroundColor: "#1D315E" }
                    : {}
                }
              >
                {category.icon && <span className="mr-2">{category.icon}</span>}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* POSTS GRID */}
      <div className="container mx-auto px-4 py-12">
        <div className="relative min-h-[600px]">
          {isLoading && posts.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
                >
                  <div className="h-64 bg-gray-200" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3 w-20" />
                    <div className="h-6 bg-gray-200 rounded mb-3" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Nessun articolo trovato
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Prova con altri termini di ricerca"
                  : "Prova a cambiare categoria o torna più tardi"}
              </p>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="mt-4 px-6 py-2 rounded-full font-semibold text-white transition-all hover:shadow-lg"
                  style={{ backgroundColor: "#1D315E" }}
                >
                  Cancella ricerca
                </button>
              )}
            </div>
          ) : (
            <>
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-200 ${
                  isLoading
                    ? "opacity-50 blur-sm pointer-events-none"
                    : "opacity-100 blur-0"
                }`}
              >
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative h-64 overflow-hidden bg-gray-900">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="w-16 h-16 text-white/30" />
                        </div>
                      )}

                      {post.isFeatured && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <TrendingUp className="w-3 h-3" />
                          In evidenza
                        </div>
                      )}

                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views.toLocaleString()}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-6">
                      {post.category && (
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                          style={{
                            backgroundColor: post.category.color || "#1D315E",
                            color: "white",
                          }}
                        >
                          {post.category.icon && (
                            <span className="mr-1">{post.category.icon}</span>
                          )}
                          {post.category.name}
                        </span>
                      )}

                      <h3
                        className="text-xl font-bold mb-3 line-clamp-2 group-hover:opacity-80 transition-opacity"
                        style={{ color: "#1F2937" }}
                      >
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {calculateReadTime(post.content)} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentPage === i + 1
                    ? "text-white shadow-lg"
                    : "text-gray-600 bg-white hover:bg-gray-100"
                }`}
                style={
                  currentPage === i + 1 ? { backgroundColor: "#1D315E" } : {}
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
