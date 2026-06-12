import { memo } from "react";
import { Link } from "react-router-dom";
import { Calendar, Eye, Clock, Sparkles } from "lucide-react";
import type { PostResponse } from "@/types/post.types";

interface PostCardProps {
  post: PostResponse;
  calculateReadTime: (content: string) => number;
  formatDate: (date: Date | null) => string;
  variant?: "default" | "compact";
}

const PostCardComponent = ({
  post,
  calculateReadTime,
  formatDate,
  variant = "default",
}: PostCardProps) => {
  if (variant === "compact") {
    return (
      <Link to={`/posts/${post.slug}`} className="pc-compact">
        <div className="pc-compact__img">
          {post.featuredImage ? (
            <img src={post.featuredImage} alt={post.title} />
          ) : (
            <div className="pc-compact__img--fallback">
              <Sparkles size={18} />
            </div>
          )}
        </div>
        <div className="pc-compact__body">
          {post.category && (
            <span
              className="pc-compact__cat"
              style={{ color: post.category.color ?? "#4F46E5" }}
            >
              {post.category.icon && <span>{post.category.icon}</span>}
              {post.category.name}
            </span>
          )}
          <h3 className="pc-compact__title">{post.title}</h3>
          <div className="pc-compact__meta">
            <span>
              <Calendar size={11} />
              {formatDate(post.publishedAt)}
            </span>
            <span>
              <Clock size={11} />
              {calculateReadTime(post.content)} min
            </span>
            <span>
              <Eye size={11} />
              {post.views.toLocaleString()}
            </span>
          </div>
        </div>

        <style>{`
          .pc-compact {
            display: flex;
            gap: 14px;
            padding: 16px 0;
            border-bottom: 1px solid #F1F5F9;
            text-decoration: none;
            transition: opacity 0.15s;
            align-items: flex-start;
          }
          .pc-compact:last-child { border-bottom: none; }
          .pc-compact:hover { opacity: 0.75; }
          .pc-compact__img {
            width: 80px;
            height: 68px;
            border-radius: 8px;
            overflow: hidden;
            flex-shrink: 0;
            background: #E2E8F0;
          }
          .pc-compact__img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }
          .pc-compact:hover .pc-compact__img img { transform: scale(1.05); }
          .pc-compact__img--fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1D315E, #0B1120);
            color: rgba(255,255,255,0.3);
          }
          .pc-compact__body {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .pc-compact__cat {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .pc-compact__title {
            font-size: 14px;
            font-weight: 700;
            color: #1E293B;
            line-height: 1.4;
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .pc-compact__meta {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 2px;
          }
          .pc-compact__meta span {
            display: flex;
            align-items: center;
            gap: 3px;
            font-size: 11px;
            color: #94A3B8;
            font-weight: 500;
          }
        `}</style>
      </Link>
    );
  }

  // variant === "default"
  return (
    <Link to={`/posts/${post.slug}`} className="pc-card">
      <div className="pc-card__img">
        {post.featuredImage ? (
          <img src={post.featuredImage} alt={post.title} />
        ) : (
          <div className="pc-card__img--fallback">
            <Sparkles size={24} />
          </div>
        )}
        {post.category && (
          <span
            className="pc-card__cat"
            style={{ background: post.category.color ?? "#4F46E5" }}
          >
            {post.category.icon && <span>{post.category.icon}</span>}
            {post.category.name}
          </span>
        )}
      </div>

      <div className="pc-card__body">
        <h3 className="pc-card__title">{post.title}</h3>
        {post.excerpt && <p className="pc-card__excerpt">{post.excerpt}</p>}
        <div className="pc-card__meta">
          <span>
            <Calendar size={11} />
            {formatDate(post.publishedAt)}
          </span>
          <span>
            <Clock size={11} />
            {calculateReadTime(post.content)} min
          </span>
          <span className="pc-card__views">
            <Eye size={11} />
            {post.views.toLocaleString()}
          </span>
        </div>
      </div>

      <style>{`
        .pc-card {
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid #E2E8F0;
          text-decoration: none;
          transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
        }
        .pc-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          transform: translateY(-2px);
          border-color: #C7D2FE;
        }
        .pc-card__img {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #E2E8F0;
          flex-shrink: 0;
        }
        .pc-card__img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .pc-card:hover .pc-card__img img { transform: scale(1.04); }
        .pc-card__img--fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1D315E, #0B1120);
          color: rgba(255,255,255,0.25);
        }
        .pc-card__cat {
          position: absolute;
          bottom: 10px;
          left: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          padding: 3px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pc-card__body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .pc-card__title {
          font-size: 15px;
          font-weight: 700;
          color: #1E293B;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pc-card__excerpt {
          font-size: 13px;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pc-card__meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid #F1F5F9;
        }
        .pc-card__meta span {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: #94A3B8;
          font-weight: 500;
        }
        .pc-card__views { margin-left: auto; }
      `}</style>
    </Link>
  );
};

export const PostCard = memo(PostCardComponent, (prev, next) => {
  return prev.post.id === next.post.id && prev.variant === next.variant;
});
