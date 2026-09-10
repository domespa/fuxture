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
});