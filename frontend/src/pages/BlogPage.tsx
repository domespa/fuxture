import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { postsAPI, categoriesAPI } from "@/services/api";
import type { PostResponse, PostFilters, PostStatus } from "@/types/post.types";
import type { Category } from "@/types/category.types";
import { useSearchParams } from "react-router-dom";
import { BlogHeader } from "../components/blog/components/post/BlogHeader";
import { CategoryNavbar } from "../components/blog/components/post/CategoryNavbar";
import { PostsGrid } from "../components/blog/components/post/PostsGrid";
import { CategoryNewsBar } from "../components/blog/components/CategoryNewsBar";
import Header from "@/components/blog/components/Header";

// MAPPING CATEGORIE
const CATEGORY_STYLES: Record<string, { icon: string; color: string }> = {
  finanza: { icon: "💰", color: "#10B981" },
  tecnologia: { icon: "💻", color: "#8B5CF6" },
  salute: { icon: "🏥", color: "#EF4444" },
  sport: { icon: "⚽", color: "#F59E0B" },
  politica: { icon: "🏛️", color: "#6366F1" },
  mondo: { icon: "🌍", color: "#14B8A6" },
  cultura: { icon: "🎭", color: "#EC4899" },
  assicurazioni: { icon: "🛡️", color: "#3B82F6" },
  concorsi: { icon: "📝", color: "#F59E0B" },
  risparmio: { icon: "💵", color: "#10B981" },
};

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoriesLoadedRef = useRef(false);
  const lastFetchParams = useRef<string>("");

  const selectedCategory = useMemo(
    () => searchParams.get("category") || "all",
    [searchParams],
  );

  const currentPage = useMemo(
    () => parseInt(searchParams.get("page") || "1"),
    [searchParams],
  );

  const searchTerm = useMemo(
    () => searchParams.get("search") || "",
    [searchParams],
  );

  const selectedCategoryData = useMemo(() => {
    if (selectedCategory === "all") return null;
    return categories.find((cat) => cat.slug === selectedCategory);
  }, [selectedCategory, categories]);

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
          (cat) => cat.slug === selectedCategory,
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
        startTransition(() => {
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
        });
      }, 500);
    },
    [setSearchParams],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    startTransition(() => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("search");
        newParams.set("page", "1");
        return newParams;
      });
    });
  }, [setSearchParams]);

  const handleCategoryChange = useCallback(
    (categorySlug: string) => {
      startTransition(() => {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("category", categorySlug);
          newParams.set("page", "1");
          return newParams;
        });
      });
    },
    [setSearchParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      startTransition(() => {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("page", page.toString());
          return newParams;
        });
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams],
  );

  const calculateReadTime = useCallback((content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, []);

  const formatDate = useCallback((date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <Header />
      <BlogHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={clearSearch}
        searchTerm={searchTerm}
        isLoading={isLoading}
        totalResults={pagination.total}
      />

      {selectedCategoryData && CATEGORY_STYLES[selectedCategoryData.slug] && (
        <CategoryNewsBar
          category={selectedCategoryData.slug}
          categoryName={selectedCategoryData.name}
          categoryIcon={CATEGORY_STYLES[selectedCategoryData.slug].icon}
          categoryColor={CATEGORY_STYLES[selectedCategoryData.slug].color}
        />
      )}

      <CategoryNavbar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        isLoading={isLoading || isPending}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="relative min-h-[600px]">
          <PostsGrid
            posts={posts}
            isLoading={isLoading || isPending}
            searchTerm={searchTerm}
            onClearSearch={clearSearch}
            calculateReadTime={calculateReadTime}
            formatDate={formatDate}
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
