import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { commentsAPI } from "@/services/api";
import type { CommentResponse } from "@/types/comment.types";

// ====================================================================================================== //
//        Ultimi commenti approvati. E' l'unico blocco della home che non si puo' riempire da soli:
//        dice che dall'altra parte c'e' qualcuno che legge. Se non ci sono commenti non si mostra,
//        perche' una sezione "discussioni" vuota comunica l'opposto di quello che serve.
// ====================================================================================================== //

const MAX_LENGTH = 140;

const formatDate = (value: Date | string): string =>
  new Date(value).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
  });

export default function RecentComments() {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Senza token l'endpoint restituisce di suo i soli commenti approvati
    commentsAPI
      .getComments({ limit: 4 })
      .then((res) => setComments(res.comments))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="rc-grid">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rc-ghost" />
        ))}
      </div>
    );
  }

  if (comments.length === 0) return null;

  return (
    <div className="rc-grid">
      {comments.map((comment) => {
        const text =
          comment.content.length > MAX_LENGTH
            ? `${comment.content.slice(0, MAX_LENGTH).trimEnd()}…`
            : comment.content;

        const body = (
          <>
            <MessageSquare size={14} className="rc-card__icon" />
            <p className="rc-card__text">{text}</p>
            <div className="rc-card__meta">
              <span className="rc-card__author">{comment.authorName}</span>
              <span className="rc-card__sep">·</span>
              <span>{formatDate(comment.createdAt)}</span>
            </div>
            {comment.post && (
              <span className="rc-card__post">su {comment.post.title}</span>
            )}
          </>
        );

        // Il link porta all'articolo commentato. Se per qualche motivo lo slug
        // non arriva, la card resta leggibile ma non cliccabile.
        return comment.post ? (
          <Link
            key={comment.id}
            to={`/posts/${comment.post.slug}`}
            className="rc-card"
          >
            {body}
          </Link>
        ) : (
          <div key={comment.id} className="rc-card rc-card--static">
            {body}
          </div>
        );
      })}
    </div>
  );
}
