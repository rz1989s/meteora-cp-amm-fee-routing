import { MetadataRoute } from 'next';

/**
 * Dynamic sitemap generator for Meteora Fee Routing Website
 *
 * This sitemap automatically regenerates on every build and deployment.
 * Add new routes to the `routes` array to include them in the sitemap.
 *
 * Features:
 * - Auto-updates with structure changes
 * - SEO-optimized with priorities and change frequencies
 * - Includes all public pages
 * - Built-in to Next.js 15+ (no external dependencies)
 *
 * Accessible at: /sitemap.xml
 */

const baseUrl = 'https://meteora-fee-routing.rectorspace.com';

// Define all routes with their metadata
const routes = [
  {
    path: '',
    priority: 1.0,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/technical',
    priority: 0.9,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/testing',
    priority: 0.9,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/documentation',
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/admin',
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/submission',
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
