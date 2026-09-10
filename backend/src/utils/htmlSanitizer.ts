import sanitizeHtml from "sanitize-html";

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  "img",
  "iframe",
  "figure",
  "figcaption",
  "video",
  "source",
];

export const sanitizePostHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: [
        "src",
        "title",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "loading",
      ],
      span: [
        "data-type",
        "scripturl",
        "iframeurl",
        "linkurl",
        "imageurl",
        "width",
        "height",
        "align",
      ],
      video: ["src", "poster", "width", "height", "controls", "preload"],
      source: ["src", "type"],
      "*": ["class", "id", "style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: [
      "www.youtube.com",
      "youtube.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
    ],
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([^)]*\)$/i],
        "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgba?\([^)]*\)$/i],
        "text-align": [/^(left|center|right|justify)$/],
        "font-size": [/^\d+(px|rem|em|%)$/],
      },
    },
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          ...(attribs.target === "_blank" && { rel: "noopener noreferrer" }),
        },
      }),
    },
  });
