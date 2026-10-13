/**
 * EcoPulse Prerender Postbuild Script
 * Generates per-route static HTML files with route-specific SEO tags, Open Graph,
 * Twitter cards, JSON-LD structured data, noscript fallbacks, and sitemap.xml.
 */

import fs from 'node:fs'
import path from 'node:path'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const SITE_URL = (process.env.VITE_SITE_URL || 'https://eco-pulse-flame.vercel.app').replace(/\/+$/, '')
const SITE_NAME = 'EcoPulse'
const SITE_TAGLINE = 'Smart Energy Saving Reminder'
const SITE_DESCRIPTION = 'Build sustainable energy-saving habits with timely reminders, estimated savings, and analytics.'

const ROUTES_META = {
  '/': {
    path: '/',
    title: 'EcoPulse · Smart Energy Saving Reminder & Habit Tracker',
    description:
      'Track and reduce electricity waste in dorms and apartments. Set habit reminders, calculate real energy savings, and build sustainable campus living routines.',
    h1: 'Smart Energy Saving Habit Dashboard',
    breadcrumb: 'Dashboard',
    indexable: true,
    priority: '1.0',
    changefreq: 'daily',
    type: 'WebApplication',
  },
  '/reminders': {
    path: '/reminders',
    title: 'Scheduled Energy Reminders & Action Alerts | EcoPulse',
    description:
      'Schedule custom recurring reminders for lamps, fans, monitors, and chargers. Eliminate standby vampiric drain and build mindful power-saving habits.',
    h1: 'Energy-Saving Habits & Scheduled Reminders',
    breadcrumb: 'Reminders',
    indexable: true,
    priority: '0.9',
    changefreq: 'daily',
    type: 'CollectionPage',
  },
  '/calculator': {
    path: '/calculator',
    title: 'Appliance Energy Cost & Savings Calculator | EcoPulse',
    description:
      'Calculate appliance electricity usage and financial savings across daily, weekly, monthly, and annual horizons with customizable domestic utility tariffs.',
    h1: 'Appliance Energy Cost & What-If Calculator',
    breadcrumb: 'Calculator',
    indexable: true,
    priority: '0.9',
    changefreq: 'weekly',
    type: 'WebPage',
  },
  '/analytics': {
    path: '/analytics',
    title: 'Conservation Analytics & Habit Streak Trends | EcoPulse',
    description:
      'Explore weekly energy savings trends, habit streaks, comparative metrics, and milestone achievement badges derived from verified conservation actions.',
    h1: 'Energy Conservation Trends & Habit Analytics',
    breadcrumb: 'Analytics',
    indexable: true,
    priority: '0.8',
    changefreq: 'daily',
    type: 'WebPage',
  },
  '/learn': {
    path: '/learn',
    title: 'Practical Energy Conservation Guides & Hub | EcoPulse',
    description:
      'Discover 10 high-impact electricity-saving guides for dorms and homes. Master vampire draw reduction, daylight harvesting, and appliance efficiency habits.',
    h1: 'Practical Energy Conservation Habits & Guides',
    breadcrumb: 'Learn',
    indexable: true,
    priority: '0.8',
    changefreq: 'weekly',
    type: 'Article',
  },
  '/settings': {
    path: '/settings',
    title: 'Preferences, Tariffs & Data Management | EcoPulse',
    description:
      'Configure utility tariff rates, active currencies, local browser alerts, and secure JSON data backups with complete client-side privacy controls.',
    h1: 'EcoPulse Settings & Energy Tariff Preferences',
    breadcrumb: 'Settings',
    indexable: false,
    priority: '0.3',
    changefreq: 'monthly',
    type: 'WebPage',
  },
  '/404': {
    path: '/404',
    title: 'Page Not Found (404) · EcoPulse Energy Saver',
    description:
      'The requested EcoPulse page could not be found or has moved. Return to the dashboard to monitor your energy-saving habits and electricity reminders.',
    h1: 'This page is switched off',
    breadcrumb: 'Not Found',
    indexable: false,
    priority: '0.0',
    changefreq: 'monthly',
    type: 'WebPage',
  },
}

function getJsonLd(routeKey) {
  const meta = ROUTES_META[routeKey]
  const canonical = `${SITE_URL}${meta.path === '/' ? '/' : meta.path}`

  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icon-512.png`,
      width: 512,
      height: 512,
      caption: 'EcoPulse Logo',
    },
    founder: [
      { '@type': 'Person', name: 'Vardaan' },
      { '@type': 'Person', name: 'Shashank' },
      { '@type': 'Person', name: 'Raina Deep' },
    ],
    description: SITE_DESCRIPTION,
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-US',
  }

  const breadcrumbList =
    meta.path !== '/'
      ? {
          '@type': 'BreadcrumbList',
          '@id': `${canonical}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Dashboard',
              item: `${SITE_URL}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: meta.breadcrumb,
              item: canonical,
            },
          ],
        }
      : null

  let primaryEntity
  if (meta.path === '/') {
    primaryEntity = {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapp`,
      url: SITE_URL,
      name: SITE_NAME,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: meta.description,
      featureList: [
        'Appliance energy cost calculator with multi-tariff support',
        'Custom recurring electricity conservation reminders',
        'Habit streak levels with animated achievement badges',
        'Client-side local storage with full JSON data export and import',
        'Offline Progressive Web App support',
      ],
      publisher: { '@id': `${SITE_URL}/#organization` },
    }
  } else if (meta.path === '/learn') {
    primaryEntity = {
      '@type': 'Article',
      '@id': `${canonical}#article`,
      url: canonical,
      headline: meta.h1,
      description: meta.description,
      inLanguage: 'en-US',
      publisher: { '@id': `${SITE_URL}/#organization` },
      mainEntityOfPage: canonical,
    }
  } else {
    primaryEntity = {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: meta.title,
      description: meta.description,
      inLanguage: 'en-US',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      breadcrumb: breadcrumbList ? { '@id': `${canonical}#breadcrumb` } : undefined,
    }
  }

  const graph = [organization, website, primaryEntity]
  if (breadcrumbList) graph.push(breadcrumbList)

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

function prerenderRoute(templateHtml, routeKey) {
  const meta = ROUTES_META[routeKey]
  const canonicalUrl = `${SITE_URL}${meta.path === '/' ? '/' : meta.path}`
  const robots = meta.indexable ? 'index, follow' : 'noindex, nofollow'
  const jsonLd = getJsonLd(routeKey)

  let html = templateHtml

  // 1. Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${meta.title}</title>`)

  // 2. Replace or insert description
  if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${meta.description}" />`)
  } else {
    html = html.replace('</head>', `  <meta name="description" content="${meta.description}" />\n  </head>`)
  }

  // 3. Replace or insert canonical
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`)
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`)
  }

  // 4. Replace or insert robots
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="${robots}" />`)
  } else {
    html = html.replace('</head>', `  <meta name="robots" content="${robots}" />\n  </head>`)
  }

  // 5. Open Graph tags
  html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${meta.title}" />`)
  html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${meta.description}" />`)
  html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonicalUrl}" />`)
  html = html.replace(/<meta\s+property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="${meta.path === '/learn' ? 'article' : 'website'}" />`)
  html = html.replace(/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${SITE_URL}/og-image.png" />`)

  // Add OG image dimensions and alt if not present
  if (!/<meta\s+property=["']og:image:width["']/i.test(html)) {
    html = html.replace('</head>', `  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="630" />\n  <meta property="og:image:alt" content="${SITE_NAME} - ${SITE_TAGLINE}" />\n  </head>`)
  }

  // 6. Twitter tags
  html = html.replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${meta.title}" />`)
  html = html.replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${meta.description}" />`)
  html = html.replace(/<meta\s+name=["']twitter:url["'][^>]*>/i, `<meta name="twitter:url" content="${canonicalUrl}" />`)
  html = html.replace(/<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${SITE_URL}/og-image.png" />`)

  // 7. Inject or replace JSON-LD
  const jsonLdScript = `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
  if (/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i.test(html)) {
    html = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i, jsonLdScript)
  } else {
    html = html.replace('</head>', `${jsonLdScript}\n  </head>`)
  }

  // 8. Inject noscript fallback before <div id="root">
  const noscriptBlock = `
    <noscript>
      <div style="max-width: 680px; margin: 40px auto; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #e6f4ea; border-radius: 16px; color: #14301f; line-height: 1.6;">
        <h1 style="font-size: 24px; margin-bottom: 12px; color: #0f2819;">${meta.h1}</h1>
        <p style="font-size: 15px; margin-bottom: 16px;">${meta.description}</p>
        <p style="font-size: 13px; color: #2d5a3c;">Please enable JavaScript to run the interactive ${SITE_NAME} application.</p>
      </div>
    </noscript>`

  html = html.replace(/<div\s+id=["']root["']>\s*<\/div>/i, `${noscriptBlock}\n    <div id="root"></div>`)

  return html
}

function generateSitemap() {
  const lastmod = new Date().toISOString().split('T')[0]
  const indexableRoutes = Object.values(ROUTES_META).filter((r) => r.indexable)

  const xmlEntries = indexableRoutes
    .map(
      (r) => `  <url>
    <loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`
}

async function main() {
  console.log('[Prerender] Starting SEO prerender & sitemap generator...')

  const indexPath = path.join(DIST_DIR, 'index.html')
  if (!fs.existsSync(indexPath)) {
    throw new Error(`dist/index.html not found at ${indexPath}. Run vite build first.`)
  }

  const templateHtml = fs.readFileSync(indexPath, 'utf-8')
  const results = []

  // Prerender all routes
  for (const [routeKey, meta] of Object.entries(ROUTES_META)) {
    const rendered = prerenderRoute(templateHtml, routeKey)
    let targetPath

    if (routeKey === '/') {
      targetPath = indexPath
    } else if (routeKey === '/404') {
      targetPath = path.join(DIST_DIR, '404.html')
    } else {
      const routeDir = path.join(DIST_DIR, meta.path.replace(/^\/+/, ''))
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true })
      }
      targetPath = path.join(routeDir, 'index.html')
    }

    fs.writeFileSync(targetPath, rendered, 'utf-8')
    const sizeKb = (Buffer.byteLength(rendered, 'utf-8') / 1024).toFixed(2)
    results.push({ route: routeKey, path: path.relative(DIST_DIR, targetPath), size: `${sizeKb} kB`, indexable: meta.indexable })
  }

  // Generate sitemap.xml in dist/
  const sitemapXml = generateSitemap()
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8')
  console.log('[Prerender] Generated dist/sitemap.xml')

  // Generate robots.txt in dist/
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /settings
Disallow: /404

Sitemap: ${SITE_URL}/sitemap.xml
`
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf-8')
  console.log('[Prerender] Generated dist/robots.txt')

  // Copy robots.txt to public/ so dev/build also keeps it
  fs.writeFileSync(path.resolve(process.cwd(), 'public/robots.txt'), robotsTxt, 'utf-8')

  console.log('\n[Prerender] Successfully prerendered per-route HTML:')
  console.table(results)
}

main().catch((err) => {
  console.error('[Prerender] Fatal error:', err)
  process.exit(1)
})
