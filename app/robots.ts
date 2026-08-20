import type { MetadataRoute } from 'next'

const SITE = 'https://issahareb.me'

/**
 * `User-agent: *` already allows every crawler, so the named blocks below
 * grant no permission that was missing. They are here for the same reason
 * the taxibbessen site has them: answer engines are the second search
 * surface this site is written for, and a named `Allow` is an unambiguous
 * statement — to their operators and to anyone auditing the file — that
 * this content is meant to be read and quoted, rather than something a
 * wildcard happens to permit by default.
 *
 * Nothing is excluded any more.
 *
 * `/_next/` used to be disallowed on the reasoning that build output is not
 * content. It is not content, but Google fetches it to *render* the page,
 * and Google's own guidance is explicit that blocking JavaScript and CSS
 * stops it seeing what a visitor sees. Search Console reported the
 * consequence on 17 Aug: three URLs under "Blocked by robots.txt".
 * Hashed build assets are not indexable on their own and need no rule.
 */
const AI_CRAWLERS = [
  // OpenAI: training, live browsing, and the search index respectively
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  // Anthropic
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  // Perplexity, Google's AI products, Apple, Amazon, Meta, Cohere,
  // ByteDance, Common Crawl, DuckDuckGo
  'PerplexityBot',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'Amazonbot',
  'FacebookBot',
  'meta-externalagent',
  'cohere-ai',
  'Bytespider',
  'CCBot',
  'DuckAssistBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
