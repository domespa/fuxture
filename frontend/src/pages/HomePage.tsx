import { useEffect, useState, useCallback } from "react";
import "./HomePage.css";
import { categoriesAPI, postsAPI } from "@/services/api";
import type { Category } from "@/types/category.types";
import type { PostResponse, PostStatus } from "@/types/post.types";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import FeaturedPost from "@/components/blog/components/FeaturedPost";
import NewsWidget from "@/components/blog/components/NewsWidget";
import BreakingNewsBar from "@/components/blog/components/BreakingNewsBar";
import { PostCard } from "@/components/blog/components/post/PostCard";
import MostRead from "@/components/blog/components/MostRead";
import GamesStrip from "@/components/blog/components/GamesStrip";
import NewsletterForm from "@/components/blog/components/Newsletterform";

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

  // Sfondo della pagina: hp-bg--aurora | hp-bg--dots | hp-bg--flat,
  // piu hp-bg--motion per il movimento lento. Le varianti sono in HomePage.css.
  return (
    <div className="hp-root hp-bg--aurora">
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
                <div className="hp-post-ghost hp-post-ghost--lead" />
                <div className="hp-post-ghost-list">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="hp-post-ghost hp-post-ghost--compact" />
                  ))}
                </div>
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
            <div className="hp-sticky">
              {/* News widget */}
              <div className="hp-section__head">
                <span className="hp-tag">Dal Mondo</span>
                <h2 className="hp-section__title">Notizie</h2>
              </div>
              <NewsWidget />

              {/* I piu letti */}
              <div className="hp-section__head hp-section__head--spaced">
                <span className="hp-tag">Classifica</span>
                <h2 className="hp-section__title">I più letti</h2>
              </div>
              <MostRead />
            </div>
          </aside>
        </div>

      </main>

      {/* ── GIOCHI ─────────────────────────────────── */}
      <GamesStrip />

      <div className="hp-main hp-main--bottom">
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

        {/* NEWSLETTER */}
        <section className="hp-newsletter">
          <div className="hp-newsletter__content">
            <span className="hp-tag">Newsletter</span>
            <h2 className="hp-newsletter__title">
              Le notizie che contano, nella tua inbox
            </h2>
            <p className="hp-newsletter__sub">
              Una selezione ragionata, senza spam. Ti disiscrivi con un click.
            </p>
            <div className="hp-newsletter__form">
              <NewsletterForm source="home-banda" />
            </div>
          </div>
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
      </div>
    </div>
  );
}
