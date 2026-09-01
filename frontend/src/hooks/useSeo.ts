import { useEffect } from "react";

interface SeoOptions {
  title?: string;
  description?: string | null;
  image?: string | null;
}

const setMeta = (
  attribute: "name" | "property",
  key: string,
  content: string
) => {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const setCanonical = (url: string) => {
  let link = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", url);
};

// ====================================================================================================== //
//        Aggiorna title e meta tag della pagina corrente.
//        Nota: il sito e una SPA senza SSR, quindi questi tag sono visti dai crawler
//        che eseguono JS (Google) ma non dai bot dei social. Per quelli serve prerendering.
// ====================================================================================================== //
export function useSeo({ title, description, image }: SeoOptions) {
  useEffect(() => {
    const previousTitle = document.title;

    if (title) {
      document.title = title;
      setMeta("property", "og:title", title);
    }

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }

    if (image) {
      setMeta("property", "og:image", image);
    }

    setMeta("property", "og:type", "website");
    setCanonical(window.location.href.split("?")[0]);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, image]);
}
