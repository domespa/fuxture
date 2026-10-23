import { describe, expect, it } from "vitest";
import {
  findMissingFooterLinks,
  findUnrecognizedImages,
  personalizeForRecipient,
} from "../src/services/tracking.service";

const FOOTER =
  '<a href="{{preferences_url}}">preferenze</a> <a href="{{unsubscribe_url}}">cancellati</a> <a href="https://fuxture.net/privacy-policy/">privacy</a>';

describe("findMissingFooterLinks", () => {
  it("accepts the GDPR footer", () => {
    expect(findMissingFooterLinks(`<p>Offerta</p>${FOOTER}`)).toEqual([]);
  });

  it("reports every missing link", () => {
    const missing = findMissingFooterLinks(
      '<p>Offerta</p><a href="{{unsubscribe_url}}">x</a>'
    );

    expect(missing).toHaveLength(2);
    expect(missing.join()).toContain("preferences_url");
    expect(missing.join()).toContain("privacy-policy");
  });

  it("does not accept the privacy link as plain text", () => {
    expect(
      findMissingFooterLinks(
        '<a href="{{preferences_url}}"></a><a href="{{unsubscribe_url}}"></a> fuxture.net/privacy-policy'
      )
    ).toHaveLength(1);
  });
});

describe("findUnrecognizedImages", () => {
  it("ignores static graphics, known pixels and relative images", () => {
    const html = [
      '<img src="https://cdn.example.com/banner.jpg">',
      '<img src="https://cdn.example.com/logo.png?v=3">',
      '<img src="https://track.adform.net/x?id=1" width="1" height="1">',
      '<img src="/uploads/foto">',
      '<img src="">',
    ].join("");

    expect(findUnrecognizedImages(html)).toEqual([]);
  });

  it("flags dynamic external images once", () => {
    const src = "https://new-tracker.example/o?c=9&u={email}";
    const html = `<img src="${src}"><img src='${src}'>`;

    expect(findUnrecognizedImages(html)).toEqual([src]);
  });
});

describe("personalizeForRecipient", () => {
  const unknown = "https://new-tracker.example/o?u={email}";
  const html = `<img src="https://cdn.example.com/banner.jpg"><img src="${unknown}"><img src="https://track.adform.net/x" width="1" height="1">`;

  it("keeps pixels and replaces the e-mail macro with the opaque id", () => {
    const result = personalizeForRecipient(html, {
      trackingId: "abc123",
      trackingConsent: true,
    });

    expect(result.strippedPixels).toEqual([]);
    expect(result.html).toContain("https://new-tracker.example/o?u=abc123");
    expect(result.html).toContain("track.adform.net");
  });

  it("strips known pixels and the ones flagged by the admin when consent is revoked", () => {
    const result = personalizeForRecipient(
      html,
      { trackingId: "abc123", trackingConsent: false },
      new Set([unknown])
    );

    expect(result.strippedPixels).toHaveLength(2);
    expect(result.html).toContain("banner.jpg");
    expect(result.html).not.toContain("new-tracker");
    expect(result.html).not.toContain("track.adform.net");
  });

  it("leaves the pixel untouched when the campaign skips the macros", () => {
    const result = personalizeForRecipient(
      html,
      { trackingId: "abc123", trackingConsent: true },
      new Set(),
      { applyMacros: false }
    );

    expect(result.html).toBe(html);
    expect(result.html).not.toContain("abc123");
  });

  it("still strips pixels on revoked consent when the macros are skipped", () => {
    const result = personalizeForRecipient(
      html,
      { trackingId: "abc123", trackingConsent: false },
      new Set([unknown]),
      { applyMacros: false }
    );

    expect(result.strippedPixels).toHaveLength(2);
    expect(result.html).toContain("banner.jpg");
    expect(result.html).not.toContain("new-tracker");
  });

  it("keeps images the admin marked as graphics", () => {
    const result = personalizeForRecipient(html, {
      trackingId: "abc123",
      trackingConsent: false,
    });

    expect(result.html).toContain("https://new-tracker.example/o?u=abc123");
    expect(result.html).not.toContain("track.adform.net");
  });
});
