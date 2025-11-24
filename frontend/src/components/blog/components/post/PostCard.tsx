import { memo } from "react";
import { Link } from "react-router-dom";
import { Calendar, Eye, Clock, TrendingUp, Sparkles } from "lucide-react";
import type { PostResponse } from "@/types/post.types";

interface PostCardProps {
  post: PostResponse;
  calculateReadTime: (content: string) => number;
  formatDate: (date: Date | null) => string;
}

const PostCardComponent = ({
  post,
  calculateReadTime,
  formatDate,
}: PostCardProps) => {
  return (
    <Link
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
  );
};

export const PostCard = memo(PostCardComponent, (prevProps, nextProps) => {
  return prevProps.post.id === nextProps.post.id;
});
