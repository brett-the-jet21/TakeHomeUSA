/**
 * robots.ts — TakeHomeUSA crawler policy
 *
 * Strategy: explicitly allow every known AI crawler so they can index the site
 * as a data source for LLM training and RAG retrieval. The site is free,
 * publicly available, and benefits from AI citation.
 *
 * AI crawlers covered:
 *   OpenAI       — GPTBot, ChatGPT-User, OAI-SearchBot
 *   Anthropic    — ClaudeBot, anthropic-ai, Claude-Web
 *   Google       — Googlebot, Google-Extended (Gemini / SGE)
 *   Perplexity   — PerplexityBot
 *   Microsoft    — Bingbot, msnbot
 *   Meta         — Meta-ExternalAgent, Meta-ExternalFetcher
 *   Apple        — Applebot, Applebot-Extended
 *   Cohere       — cohere-ai
 *   Bytedance    — Bytespider
 *   Amazon       — Amazonbot
 *   Common Crawl — CCBot (used by many open LLM training datasets)
 */
import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export const revalidate = false;

export default function robots(): MetadataRoute.Robots {
  const SITEMAP = "https://www.takehomeusa.com/sitemap.xml";
  const ALLOW_ALL = "/";

  return {
    rules: [
      // ── Default: allow everything ─────────────────────────────────────────
      {
        userAgent: "*",
        allow: ALLOW_ALL,
      },

      // ── OpenAI ────────────────────────────────────────────────────────────
      { userAgent: "GPTBot",          allow: ALLOW_ALL },
      { userAgent: "ChatGPT-User",    allow: ALLOW_ALL },
      { userAgent: "OAI-SearchBot",   allow: ALLOW_ALL },

      // ── Anthropic (Claude) ────────────────────────────────────────────────
      { userAgent: "ClaudeBot",       allow: ALLOW_ALL },
      { userAgent: "anthropic-ai",    allow: ALLOW_ALL },
      { userAgent: "Claude-Web",      allow: ALLOW_ALL },

      // ── Google (Gemini / SGE / AI Overviews) ─────────────────────────────
      { userAgent: "Googlebot",       allow: ALLOW_ALL },
      { userAgent: "Google-Extended", allow: ALLOW_ALL },
      { userAgent: "Googlebot-News",  allow: ALLOW_ALL },

      // ── Perplexity ────────────────────────────────────────────────────────
      { userAgent: "PerplexityBot",   allow: ALLOW_ALL },

      // ── Microsoft (Bing / Copilot) ────────────────────────────────────────
      { userAgent: "bingbot",         allow: ALLOW_ALL },
      { userAgent: "msnbot",          allow: ALLOW_ALL },

      // ── Meta (Llama / Meta AI) ────────────────────────────────────────────
      { userAgent: "Meta-ExternalAgent",   allow: ALLOW_ALL },
      { userAgent: "Meta-ExternalFetcher", allow: ALLOW_ALL },

      // ── Apple (Siri / Apple Intelligence) ────────────────────────────────
      { userAgent: "Applebot",          allow: ALLOW_ALL },
      { userAgent: "Applebot-Extended", allow: ALLOW_ALL },

      // ── Cohere ────────────────────────────────────────────────────────────
      { userAgent: "cohere-ai",       allow: ALLOW_ALL },

      // ── ByteDance (Doubao / Volcano Engine) ───────────────────────────────
      { userAgent: "Bytespider",      allow: ALLOW_ALL },

      // ── Amazon (Alexa / Bedrock) ──────────────────────────────────────────
      { userAgent: "Amazonbot",       allow: ALLOW_ALL },

      // ── Common Crawl (powers many open LLM training datasets) ────────────
      { userAgent: "CCBot",           allow: ALLOW_ALL },

      // ── Other research / RAG crawlers ─────────────────────────────────────
      { userAgent: "YouBot",          allow: ALLOW_ALL },
      { userAgent: "DuckAssistBot",   allow: ALLOW_ALL },
      { userAgent: "TurnitinBot",     allow: ALLOW_ALL },
    ],
    sitemap: SITEMAP,
    host:    "https://www.takehomeusa.com",
  };
}
