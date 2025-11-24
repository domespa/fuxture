import { memo } from "react";
import type { Category } from "@/types/category.types";

interface CategoryNavbarProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categorySlug: string) => void;
  isLoading: boolean;
}

const CategoryNavbarComponent = ({
  categories,
  selectedCategory,
  onCategoryChange,
  isLoading,
}: CategoryNavbarProps) => {
  return (
    <div className="sticky top-0 z-40 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => onCategoryChange("all")}
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
              onClick={() => onCategoryChange(category.slug)}
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
  );
};

export const CategoryNavbar = memo(
  CategoryNavbarComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.selectedCategory === nextProps.selectedCategory &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.categories.length === nextProps.categories.length
    );
  }
);
