import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postsAPI } from "@/services/api";
import type { PostTag } from "@/types/post.types";

// ====================================================================================================== //
//        Argomenti: i tag esistono su ogni articolo da sempre e non erano mai stati mostrati.
//        Danno navigazione laterale, che e' il modo piu' economico per far leggere un secondo pezzo.
//        La dimensione della pillola segue il numero di articoli: il peso visivo dice dove c'e' piu' roba.
// ====================================================================================================== //

const WEIGHTS = ["tc-pill--sm", "tc-pill--md", "tc-pill--lg"] as const;

export default function TagCloud() {
  const [tags, setTags] = useState<PostTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    postsAPI
      .getTags(18)
      .then(setTags)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="tc-cloud">
        {[...Array(8)].map((_, i) => (
          <span key={i} className="tc-ghost" />
        ))}
      </div>
    );
  }

  // Senza tag la sezione non ha ragione di esistere
  if (tags.length === 0) return null;

  const max = Math.max(...tags.map((tag) => tag.count));

  return (
    <div className="tc-cloud">
      {tags.map((tag) => {
        // Tre soli livelli: piu' sfumature renderebbero il confronto illeggibile
        const ratio = tag.count / max;
        const weight =
          ratio > 0.66 ? WEIGHTS[2] : ratio > 0.33 ? WEIGHTS[1] : WEIGHTS[0];

        return (
          <Link
            key={tag.name}
            to={`/posts?tags=${encodeURIComponent(tag.name)}`}
            className={`tc-pill ${weight}`}
          >
            {tag.name}
            <span className="tc-pill__count">{tag.count}</span>
          </Link>
        );
      })}
    </div>
  );
}
