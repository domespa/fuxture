import { describe, expect, it } from "vitest";
import { sanitizePostHtml } from "../src/utils/htmlSanitizer";

describe("sanitizePostHtml", () => {
  it("removes executable markup and unsafe URLs", () => {
    const result = sanitizePostHtml(
      '<p>Hello</p><script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(2)">',
    );

    expect(result).toContain("<p>Hello</p>");
    expect(result).not.toContain("script");
    expect(result).not.toContain("onerror");
    expect(result).not.toContain("javascript:");
  });

  it("preserves safe links and adds rel protection to blank targets", () => {
    const result = sanitizePostHtml(
      '<a href="https://example.com" target="_blank">Read more</a>',
    );

    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it("preserves links wrapped around images", () => {
    const result = sanitizePostHtml(
      '<a href="https://example.com" target="_blank"><img src="https://example.com/image.jpg" data-link="https://example.com"></a>',
    );

    expect(result).toContain('<a href="https://example.com"');
    expect(result).toContain('src="https://example.com/image.jpg"');
    expect(result).not.toContain("data-link");
  });

  it("preserves image alignment", () => {
    const result = sanitizePostHtml(
      '<img src="https://example.com/image.jpg" data-align="center">',
    );

    expect(result).toContain('data-align="center"');
  });

  it("preserves Awin banner placeholders", () => {
    const result = sanitizePostHtml(
      '<span data-type="awin-banner" iframeurl="https://www.awin1.com/banner" width="300" height="600" align="center"></span>' +
        '<span data-type="awin-banner-link" linkurl="https://example.com" imageurl="https://www.awinhosting.com/banner.jpg" align="right"></span>',
    );

    expect(result).toContain('data-type="awin-banner"');
    expect(result).toContain('iframeurl="https://www.awin1.com/banner"');
    expect(result).toContain('data-type="awin-banner-link"');
    expect(result).toContain(
      'imageurl="https://www.awinhosting.com/banner.jpg"',
    );
  });
});
