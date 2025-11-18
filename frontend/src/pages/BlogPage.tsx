import { useEffect, useState } from "react";
import { postsAPI, categoriesAPI } from "@/services/api";
import type { PostResponse, PostFilters, PostStatus } from "@/types/post.types";
import type { Category } from "@/types/category.types";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Calendar,
  Eye,
  User,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  const selectedCategory = searchParams.get("category") || "all";

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [selectedCategory, searchParams]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getCategories(false);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const filters: PostFilters = {
        status: "PUBLISHED" as PostStatus,
        page: searchParams.get("page") || "1",
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

      console.log("🔍 Filters inviati:", filters);

      const response = await postsAPI.getPosts(filters);
      const postsData = "posts" in response ? response.posts : response;
      const paginationData =
        "pagination" in response ? response.pagination : null;

      console.log("📝 Posts ricevuti:", postsData);

      setPosts(postsData);
      if (paginationData) {
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSearchParams({ category: categorySlug });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

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
            <h1 className="text-5xl font-extrabold text-white mb-4">
              Blog Fuxture
            </h1>
            <p className="text-gray-200 text-lg mb-8">
              Articoli, guide e approfondimenti sul mondo che ci circonda
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca articoli..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-900"
                style={{
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = "0 0 0 3px rgba(29, 49, 94, 0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES NAVBAR */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
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
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
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
        {isLoading ? (
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
              Prova a cambiare categoria o torna più tardi
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                to={`/posts/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
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

                  {/* Featured Badge */}
                  {post.isFeatured && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <TrendingUp className="w-3 h-3" />
                      In evidenza
                    </div>
                  )}

                  {/* Views Counter */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.views.toLocaleString()}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category */}
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

                  {/* Title */}
                  <h3
                    className="text-xl font-bold mb-3 line-clamp-2 group-hover:opacity-80 transition-opacity"
                    style={{ color: "#1F2937" }}
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta Info */}
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

                  {/* Author */}
                  <div className="flex items-center gap-2 mt-4">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {post.author.firstName} {post.author.lastName}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() =>
                  setSearchParams({
                    category: selectedCategory,
                    page: (i + 1).toString(),
                  })
                }
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  pagination.page === i + 1
                    ? "text-white shadow-lg"
                    : "text-gray-600 bg-white hover:bg-gray-100"
                }`}
                style={
                  pagination.page === i + 1
                    ? { backgroundColor: "#1D315E" }
                    : {}
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
