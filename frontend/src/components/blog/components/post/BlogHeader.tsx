import { memo, useCallback } from "react";
import { Search, X } from "lucide-react";

interface BlogHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  searchTerm: string;
  isLoading: boolean;
  totalResults: number;
}

const BlogHeaderComponent = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  searchTerm,
  isLoading,
  totalResults,
}: BlogHeaderProps) => {
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

  return (
    <div
      className="py-16 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom right, #1F2937, #1D315E)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cerca articoli..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="w-full pl-12 pr-12 py-4 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-900 transition-shadow"
              style={{
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              }}
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
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
                  {totalResults} {totalResults === 1 ? "articolo" : "articoli"})
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const BlogHeader = memo(BlogHeaderComponent);
