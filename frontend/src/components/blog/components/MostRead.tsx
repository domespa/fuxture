import { useEffect, useState } from "react";
import "./MostRead.css";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { postsAPI } from "@/services/api";
import type { PostResponse, PostStatus } from "@/types/post.types";

// ====================================================================================================== //
//        I piu letti: usa il campo views che gia esiste su ogni post e che finora
//        non era mostrato da nessuna parte in home. Riempie la colonna destra e
//        aggiunge link interni verso gli articoli che funzionano.
// ====================================================================================================== //
export default function MostRead() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    postsAPI
      .getPosts({
        status: "PUBLISHED" as PostStatus,
        limit: 5,
        sortBy: "views",
        sortOrder: "desc",
      })
      .then((res) => {
        const data = "posts" in res ? res.posts : res;
        setPosts(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && posts.length === 0) return null;

  return (
    <div className="mr-widget">
      {isLoading ? (
        <div className="mr-skeleton">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mr-ghost" />
          ))}
        </div>
      ) : (
        <ol className="mr-list">
          {posts.map((post, index) => (
            <li key={post.id}>
              <Link to={`/posts/${post.slug}`} className="mr-item">
                <span className="mr-rank">{index + 1}</span>
                <span className="mr-body">
                  <span className="mr-title">{post.title}</span>
                  <span className="mr-views">
                    <Eye size={11} />
                    {post.views.toLocaleString("it-IT")} letture
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
