import { useEffect, useState, useCallback } from "react";
import { postsAPI } from "@/services/api";
import type { PostResponse, PostStatus } from "@/types/post.types";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function FeaturedPost() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    postsAPI
      .getPosts({
        status: "PUBLISHED" as PostStatus,
        isFeatured: true,
        limit: 5,
        sortBy: "publishedAt",
        sortOrder: "desc",
      })
      .then((res) => {
        const data = "posts" in res ? res.posts : res;
        setPosts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Reset imgError when slide changes
  useEffect(() => {
    setImgError(false);
  }, [current]);

  // Auto-advance
  useEffect(() => {
    if (posts.length < 2) return;
    const t = setInterval(
      () => setCurrent((p) => (p + 1) % posts.length),
      6000,
    );
    return () => clearInterval(t);
  }, [posts.length]);

  const prev = useCallback(
    () => setCurrent((p) => (p - 1 + posts.length) % posts.length),
    [posts.length],
  );
  const next = useCallback(
    () => setCurrent((p) => (p + 1) % posts.length),
    [posts.length],
  );

  const formatDate = (d: Date | null) =>
    d
      ? new Date(d).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "";

  const readTime = (content: string) =>
    Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  if (loading) {
    return <div className="fp-skeleton" aria-busy="true" />;
  }

  if (posts.length === 0) return null;

  const post = posts[current];

  return (
    <div className="fp-wrap">
      {/* Immagine di sfondo */}
      <div className="fp-bg">
        {post.featuredImage && !imgError ? (
          <img
            src={post.featuredImage}
            alt=""
            className="fp-bg__img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="fp-bg__fallback" />
        )}
        <div className="fp-bg__overlay" />
      </div>

      {/* Contenuto */}
      <div className="fp-content">
        <div className="fp-content__inner">
          {/* Badges */}
          <div className="fp-badges">
            <span className="fp-badge fp-badge--featured">In Evidenza</span>
            {post.category && (
              <span
                className="fp-badge fp-badge--cat"
                style={{ background: post.category.color ?? "#4F46E5" }}
              >
                {post.category.icon && <span>{post.category.icon}</span>}
                {post.category.name}
              </span>
            )}
          </div>

          {/* Titolo */}
          <h1 className="fp-title">{post.title}</h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="fp-excerpt">
              {post.excerpt.length > 160
                ? post.excerpt.slice(0, 160) + "…"
                : post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="fp-meta">
            <span className="fp-meta__item">
              <Calendar size={13} />
              {formatDate(post.publishedAt)}
            </span>
            <span className="fp-meta__dot" />
            <span className="fp-meta__item">
              <Clock size={13} />
              {readTime(post.content)} min
            </span>
          </div>

          {/* CTA */}
          <Link to={`/posts/${post.slug}`} className="fp-cta">
            Leggi l'articolo <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Controlli navigazione */}
      {posts.length > 1 && (
        <>
          <button
            className="fp-nav fp-nav--prev"
            onClick={prev}
            aria-label="Precedente"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="fp-nav fp-nav--next"
            onClick={next}
            aria-label="Successivo"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="fp-dots">
            {posts.map((_, i) => (
              <button
                key={i}
                className={`fp-dot ${i === current ? "fp-dot--active" : ""}`}
                onClick={() => setCurrent(i)}
                aria-label={`Articolo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .fp-wrap {
          position: relative;
          height: clamp(300px, 42vh, 460px);
          overflow: hidden;
          background: #0B1120;
        }

        /* BG */
        .fp-skeleton {
          height: clamp(300px, 42vh, 460px);
          background: linear-gradient(135deg, #0B1120, #1D315E);
          animation: fp-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes fp-shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .fp-bg {
          position: absolute;
          inset: 0;
        }
        .fp-bg__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .fp-bg__fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1D315E, #0B1120);
        }
        .fp-bg__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(7, 11, 22, 0.92) 0%,
            rgba(7, 11, 22, 0.75) 50%,
            rgba(7, 11, 22, 0.3) 100%
          );
        }

        /* CONTENT */
        .fp-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          z-index: 10;
        }
        .fp-content__inner {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px 48px;
          max-width: 640px;
          margin-left: max(24px, calc((100vw - 1200px) / 2));
        }

        /* BADGES */
        .fp-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .fp-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 4px;
          color: #fff;
        }
        .fp-badge--featured {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(8px);
        }
        .fp-badge--cat {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* TITLE */
        .fp-title {
          font-size: clamp(1.5rem, 3.5vw, 2.4rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin: 0 0 12px;
        }

        /* EXCERPT */
        .fp-excerpt {
          font-size: 15px;
          color: rgba(255,255,255,0.65);
          line-height: 1.6;
          margin: 0 0 16px;
        }

        /* META */
        .fp-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .fp-meta__item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          font-weight: 500;
        }
        .fp-meta__dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
        }

        /* CTA */
        .fp-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #0F172A;
          font-size: 13px;
          font-weight: 700;
          padding: 11px 20px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s, gap 0.15s, transform 0.15s;
        }
        .fp-cta:hover {
          background: #F1F5F9;
          gap: 12px;
          transform: translateY(-1px);
        }

        /* NAV BUTTONS */
        .fp-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .fp-nav:hover { background: rgba(255,255,255,0.2); }
        .fp-nav--prev { left: 20px; }
        .fp-nav--next { right: 20px; }

        /* DOTS */
        .fp-dots {
          position: absolute;
          bottom: 20px;
          right: 24px;
          display: flex;
          gap: 6px;
          z-index: 20;
        }
        .fp-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          transition: background 0.2s, width 0.2s;
          padding: 0;
        }
        .fp-dot--active {
          background: #fff;
          width: 20px;
          border-radius: 3px;
        }

        @media (max-width: 640px) {
          .fp-content__inner {
            margin-left: 0;
            padding: 0 16px 36px;
          }
          .fp-bg__overlay {
            background: linear-gradient(
              to top,
              rgba(7,11,22,0.95) 0%,
              rgba(7,11,22,0.5) 60%,
              rgba(7,11,22,0.2) 100%
            );
          }
          .fp-nav { display: none; }
        }
      `}</style>
    </div>
  );
}
