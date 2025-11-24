import { memo } from "react";
import { PostCard } from "./PostCard";
import type { PostResponse } from "@/types/post.types";

interface PostsGridProps {
  posts: PostResponse[];
  isLoading: boolean;
  searchTerm: string;
  onClearSearch: () => void;
  calculateReadTime: (content: string) => number;
  formatDate: (date: Date | null) => string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PostsGridComponent = ({
  posts,
  isLoading,
  searchTerm,
  onClearSearch,
  calculateReadTime,
  formatDate,
  currentPage,
  totalPages,
  onPageChange,
}: PostsGridProps) => {
  // Loading skeleton
  if (isLoading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
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
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
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
            onClick={onClearSearch}
            className="mt-4 px-6 py-2 rounded-full font-semibold text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: "#1D315E" }}
          >
            Cancella ricerca
          </button>
        )}
      </div>
    );
  }

  // Posts grid
  return (
    <>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-200 ${
          isLoading
            ? "opacity-50 blur-sm pointer-events-none"
            : "opacity-100 blur-0"
        }`}
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            calculateReadTime={calculateReadTime}
            formatDate={formatDate}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
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
    </>
  );
};

export const PostsGrid = memo(PostsGridComponent, (prevProps, nextProps) => {
  return (
    prevProps.posts === nextProps.posts &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages
  );
});
