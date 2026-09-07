import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, X } from "lucide-react";
import {
  clearRecentPosts,
  getRecentPosts,
  type RecentPost,
} from "@/lib/recentlyViewed";

// ====================================================================================================== //
//        "Riprendi da dove eri": gli ultimi articoli aperti su questo dispositivo.
//        Compare solo a chi torna, quindi al primo accesso la home resta identica a prima.
//        Il dato vive in localStorage e non raggiunge mai il server: nessun consenso richiesto.
// ====================================================================================================== //

export default function RecentlyViewed() {
  const [posts, setPosts] = useState<RecentPost[]>([]);

  // La lettura avviene dopo il mount: in SSR o in prerendering localStorage
  // non esiste, e leggerlo durante il render darebbe markup incoerente.
  useEffect(() => {
    setPosts(getRecentPosts(3));
  }, []);

  if (posts.length === 0) return null;

  const forget = () => {
    clearRecentPosts();
    setPosts([]);
  };

  return (
    <section className="rv-band">
      <div className="rv-head">
        <span className="rv-label">
          <History size={13} />
          Riprendi da dove eri
        </span>
        <button type="button" onClick={forget} className="rv-clear">
          <X size={12} />
          Cancella
        </button>
      </div>

      <div className="rv-list">
        {posts.map((post) => (
          <Link key={post.slug} to={`/posts/${post.slug}`} className="rv-item">
            {post.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
