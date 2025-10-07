import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration for Meteora Fee Routing Website
 *
 * This robots.txt file:
 * - Allows all search engines to crawl the site
 * - Points to the sitemap for efficient indexing
 * - Automatically regenerates on deployment
 *
 * Accessible at: /robots.txt
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://meteora-fee-routing.rectorspace.com/sitemap.xml',
  };
}
