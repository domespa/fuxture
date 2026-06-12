import { useEffect, useState, useCallback } from "react";
import { categoriesAPI, postsAPI } from "@/services/api";
import type { Category } from "@/types/category.types";
import type { PostResponse, PostStatus } from "@/types/post.types";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import FeaturedPost from "@/components/blog/components/FeaturedPost";
import NewsWidget from "@/components/blog/components/NewsWidget";
import BreakingNewsBar from "@/components/blog/components/BreakingNewsBar";
import { PostCard } from "@/components/blog/components/post/PostCard";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const formatDate = useCallback((date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const calculateReadTime = useCallback((content: string) => {
    return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
  }, []);

  useEffect(() => {
    categoriesAPI
      .getCategories(false)
      .then(setCategories)
      .catch(console.error)
      .finally(() => setIsLoading(false));

    postsAPI
      .getPosts({
        status: "PUBLISHED" as PostStatus,
        limit: 6,
        sortBy: "publishedAt",
        sortOrder: "desc",
      })
      .then((res) => {
        const data = "posts" in res ? res.posts : res;
        setRecentPosts(data);
      })
      .catch(console.error)
      .finally(() => setPostsLoading(false));
  }, []);

  return (
    <div className="hp-root">
      {/* ── TOPBAR ─────────────────────────────────── */}
      <div className="hp-topbar">
        <div className="hp-topbar__inner">
          <Link to="/" className="hp-topbar__brand">
            <img src="/logo.png" alt="Fuxture" className="hp-topbar__logo" />
            <span className="hp-topbar__name">Fuxture</span>
          </Link>
          <nav className="hp-topbar__nav">
            <Link to="/posts" className="hp-topbar__link">
              <TrendingUp size={14} />
              Tutti gli Articoli
            </Link>
          </nav>
        </div>
      </div>

      {/* ── FEATURED ───────────────────────────────── */}
      <FeaturedPost />

      {/* ── BREAKING NEWS ──────────────────────────── */}
      <BreakingNewsBar />

      {/* ── MAIN ───────────────────────────────────── */}
      <main className="hp-main">
        {/* Layout a due colonne: articoli + sidebar */}
        <div className="hp-grid">
          {/* Colonna sinistra: ultimi articoli */}
          <section className="hp-col-main">
            <div className="hp-section__head">
              <span className="hp-tag hp-tag--live">● Live</span>
              <h2 className="hp-section__title">Ultimi Articoli</h2>
              <Link to="/posts" className="hp-section__more">
                Vedi tutti <ArrowRight size={13} />
              </Link>
            </div>

            {postsLoading ? (
              <div className="hp-posts-skeleton">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="hp-post-ghost" />
                ))}
              </div>
            ) : (
              <div className="hp-posts-list">
                {/* Prima card grande */}
                {recentPosts[0] && (
                  <PostCard
                    post={recentPosts[0]}
                    calculateReadTime={calculateReadTime}
                    formatDate={formatDate}
                    variant="default"
                  />
                )}
                {/* Restanti compatte */}
                <div className="hp-compact-list">
                  {recentPosts.slice(1).map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      calculateReadTime={calculateReadTime}
                      formatDate={formatDate}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Sidebar destra */}
          <aside className="hp-col-side">
            {/* News widget */}
            <div className="hp-sticky">
              <div className="hp-section__head">
                <span className="hp-tag">Dal Mondo</span>
                <h2 className="hp-section__title">Notizie</h2>
              </div>
              <NewsWidget />
            </div>
          </aside>
        </div>

        {/* SEZIONE CATEGORIE VISIVA */}
        <section className="hp-section">
          <div className="hp-section__head">
            <span className="hp-tag">Esplora</span>
            <h2 className="hp-section__title">Scegli l'argomento</h2>
          </div>
          {isLoading ? (
            <div className="hp-catgrid-skeleton">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="hp-catgrid-ghost" />
              ))}
            </div>
          ) : (
            <div className="hp-catgrid">
              {categories
                .filter((c) => (c._count?.posts ?? 0) > 0)
                .map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/posts?category=${cat.slug}`}
                    className="hp-catcard"
                    style={
                      {
                        "--cat-color": cat.color ?? "#4F46E5",
                      } as React.CSSProperties
                    }
                  >
                    <div className="hp-catcard__bg" />
                    <span className="hp-catcard__icon">{cat.icon}</span>
                    <span className="hp-catcard__name">{cat.name}</span>
                    <span className="hp-catcard__count">
                      {cat._count?.posts}{" "}
                      {cat._count?.posts === 1 ? "articolo" : "articoli"}
                    </span>
                    <ArrowRight size={14} className="hp-catcard__arrow" />
                  </Link>
                ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="hp-cta">
          <div className="hp-cta__glow" aria-hidden />
          <div className="hp-cta__content">
            <p className="hp-cta__eyebrow">Ogni giorno, senza rumore</p>
            <h2 className="hp-cta__title">Le notizie che contano</h2>
            <Link to="/posts" className="hp-cta__btn">
              Esplora tutti gli articoli <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      <style>{`
        .hp-root {
          min-height: 100vh;
          background: #F1F5F9;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* TOPBAR */
        .hp-topbar {
          background: #0B1120;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .hp-topbar__inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hp-topbar__brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .hp-topbar__logo {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }
        .hp-topbar__name {
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .hp-topbar__nav { display: flex; gap: 4px; }
        .hp-topbar__link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .hp-topbar__link:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }

        /* MAIN */
        .hp-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 36px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        /* TWO COL GRID */
        .hp-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .hp-grid { grid-template-columns: 1fr; }
          .hp-sticky { position: static !important; }
        }

        /* STICKY SIDEBAR */
        .hp-sticky {
          position: sticky;
          top: 68px;
        }

        /* SECTION HEAD */
        .hp-section__head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .hp-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #fff;
          background: #1D315E;
          padding: 3px 8px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .hp-tag--live {
          background: #DC2626;
          animation: hp-pulse 2s ease-in-out infinite;
        }
        @keyframes hp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .hp-section__title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          flex: 1;
          margin: 0;
        }
        .hp-section__more {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #4F46E5;
          text-decoration: none;
          white-space: nowrap;
          transition: gap 0.15s;
        }
        .hp-section__more:hover { gap: 7px; }

        /* POSTS */
        .hp-posts-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .hp-posts-list > *:first-child {
          margin-bottom: 20px;
        }
        .hp-compact-list {
          background: #fff;
          border-radius: 14px;
          border: 1.5px solid #E2E8F0;
          padding: 0 16px;
          overflow: hidden;
        }
        .hp-posts-skeleton {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .hp-post-ghost {
          height: 72px;
          border-radius: 10px;
          background: #E2E8F0;
          animation: hp-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes hp-shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* CATEGORIE */
        .hp-cats {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .hp-cats-skeleton {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .hp-cat-ghost {
          height: 40px;
          border-radius: 8px;
          background: #E2E8F0;
          animation: hp-shimmer 1.4s ease-in-out infinite;
        }
        .hp-cat {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          padding: 9px 12px;
          text-decoration: none;
          transition: border-color 0.15s, background 0.15s;
          position: relative;
          overflow: hidden;
        }
        .hp-cat::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--cat-color, #4F46E5);
          transform: scaleY(0);
          transition: transform 0.2s;
          border-radius: 0 2px 2px 0;
        }
        .hp-cat:hover {
          border-color: var(--cat-color, #4F46E5);
          background: #F8FAFC;
        }
        .hp-cat:hover::before { transform: scaleY(1); }
        .hp-cat__icon { font-size: 15px; flex-shrink: 0; }
        .hp-cat__name {
          font-size: 13px;
          font-weight: 600;
          color: #1E293B;
          flex: 1;
        }
        .hp-cat__count {
          font-size: 11px;
          font-weight: 600;
          color: #94A3B8;
          background: #F1F5F9;
          padding: 1px 6px;
          border-radius: 20px;
        }

        /* CATEGORY GRID */
        .hp-catgrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .hp-catgrid-skeleton {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .hp-catgrid-ghost {
          height: 120px;
          border-radius: 14px;
          background: #E2E8F0;
          animation: hp-shimmer 1.4s ease-in-out infinite;
        }
        .hp-catcard {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          gap: 4px;
          height: 130px;
          border-radius: 14px;
          padding: 16px;
          text-decoration: none;
          overflow: hidden;
          border: 1.5px solid transparent;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          background: #fff;
        }
        .hp-catcard__bg {
          position: absolute;
          inset: 0;
          background: var(--cat-color, #4F46E5);
          opacity: 0.08;
          transition: opacity 0.2s;
        }
        .hp-catcard:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.1);
          border-color: var(--cat-color, #4F46E5);
        }
        .hp-catcard:hover .hp-catcard__bg { opacity: 0.15; }
        .hp-catcard__icon {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .hp-catcard__name {
          font-size: 14px;
          font-weight: 700;
          color: #1E293B;
          line-height: 1.2;
        }
        .hp-catcard__count {
          font-size: 11px;
          color: #94A3B8;
          font-weight: 500;
        }
        .hp-catcard__arrow {
          position: absolute;
          top: 14px;
          right: 14px;
          color: var(--cat-color, #4F46E5);
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s, transform 0.2s;
        }
        .hp-catcard:hover .hp-catcard__arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* CTA */
        .hp-cta {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #0B1120 0%, #1D315E 60%, #1E1B4B 100%);
          padding: 48px 48px;
        }
        .hp-cta__glow {
          position: absolute;
          right: -80px; top: -80px;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .hp-cta__content { position: relative; z-index: 1; }
        .hp-cta__eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #818CF8;
          margin: 0 0 8px;
        }
        .hp-cta__title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          margin: 0 0 20px;
        }
        .hp-cta__btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #4F46E5;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          padding: 11px 20px;
          border-radius: 9px;
          text-decoration: none;
          transition: background 0.15s, gap 0.15s, transform 0.15s;
        }
        .hp-cta__btn:hover {
          background: #4338CA;
          gap: 12px;
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .hp-topbar__name { display: none; }
          .hp-main { padding: 20px 16px 60px; gap: 36px; }
          .hp-cta { padding: 32px 20px; }
        }
      `}</style>
    </div>
  );
}
