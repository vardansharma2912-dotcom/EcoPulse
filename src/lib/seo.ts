/**
 * EcoPulse SEO & Structured Data Master Configuration
 * Single source of truth for route metadata, titles, descriptions, canonicals,
 * breadcrumbs, JSON-LD schemas, and sitemap generation.
 */

import { useEffect } from 'react'
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, absoluteUrl } from './site'

export interface RouteMeta {
  path: string
  title: string
  description: string
  h1: string
  breadcrumb: string
  indexable: boolean
  priority: number // sitemap priority 0.0 - 1.0
  changefreq: 'daily' | 'weekly' | 'monthly'
  structuredDataType: 'WebApplication' | 'CollectionPage' | 'WebPage' | 'Article'
}

export const ROUTES_META: Record<string, RouteMeta> = {
  '/': {
    path: '/',
    title: 'EcoPulse · Smart Energy Saving Reminder & Habit Tracker',
    description:
      'Track and reduce electricity waste in dorms and apartments. Set habit reminders, calculate real energy savings, and build sustainable campus living routines.',
    h1: 'Smart Energy Saving Habit Dashboard',
    breadcrumb: 'Dashboard',
    indexable: true,
    priority: 1.0,
    changefreq: 'daily',
    structuredDataType: 'WebApplication',
  },
  '/reminders': {
    path: '/reminders',
    title: 'Scheduled Energy Reminders & Action Alerts | EcoPulse',
    description:
      'Schedule custom recurring reminders for lamps, fans, monitors, and chargers. Eliminate standby vampiric drain and build mindful power-saving habits.',
    h1: 'Energy-Saving Habits & Scheduled Reminders',
    breadcrumb: 'Reminders',
    indexable: true,
    priority: 0.9,
    changefreq: 'daily',
    structuredDataType: 'CollectionPage',
  },
  '/calculator': {
    path: '/calculator',
    title: 'Appliance Energy Cost & Savings Calculator | EcoPulse',
    description:
      'Calculate appliance electricity usage and financial savings across daily, weekly, monthly, and annual horizons with customizable domestic utility tariffs.',
    h1: 'Appliance Energy Cost & What-If Calculator',
    breadcrumb: 'Calculator',
    indexable: true,
    priority: 0.9,
    changefreq: 'weekly',
    structuredDataType: 'WebPage',
  },
  '/analytics': {
    path: '/analytics',
    title: 'Conservation Analytics & Habit Streak Trends | EcoPulse',
    description:
      'Explore weekly energy savings trends, habit streaks, comparative metrics, and milestone achievement badges derived from verified conservation actions.',
    h1: 'Energy Conservation Trends & Habit Analytics',
    breadcrumb: 'Analytics',
    indexable: true,
    priority: 0.8,
    changefreq: 'daily',
    structuredDataType: 'WebPage',
  },
  '/learn': {
    path: '/learn',
    title: 'Practical Energy Conservation Guides & Hub | EcoPulse',
    description:
      'Discover 10 high-impact electricity-saving guides for dorms and homes. Master vampire draw reduction, daylight harvesting, and appliance efficiency habits.',
    h1: 'Practical Energy Conservation Habits & Guides',
    breadcrumb: 'Learn',
    indexable: true,
    priority: 0.8,
    changefreq: 'weekly',
    structuredDataType: 'Article',
  },
  '/settings': {
    path: '/settings',
    title: 'Preferences, Tariffs & Data Management | EcoPulse',
    description:
      'Configure utility tariff rates, active currencies, local browser alerts, and secure JSON data backups with complete client-side privacy controls.',
    h1: 'EcoPulse Settings & Energy Tariff Preferences',
    breadcrumb: 'Settings',
    indexable: false, // Personal settings and data management
    priority: 0.3,
    changefreq: 'monthly',
    structuredDataType: 'WebPage',
  },
  '/404': {
    path: '/404',
    title: 'Page Not Found (404) · EcoPulse Energy Saver',
    description:
      'The requested EcoPulse page could not be found or has moved. Return to the dashboard to monitor your energy-saving habits and electricity reminders.',
    h1: 'This page is switched off',
    breadcrumb: 'Not Found',
    indexable: false,
    priority: 0.0,
    changefreq: 'monthly',
    structuredDataType: 'WebPage',
  },
}

/**
 * Normalizes a path to match a known route key in ROUTES_META.
 */
export function getRouteMeta(pathname: string): RouteMeta {
  const cleanPath = pathname.replace(/\/+$/, '') || '/'
  return ROUTES_META[cleanPath] || ROUTES_META['/404']
}

/**
 * Generates truth-in-advertising JSON-LD structured data graph for a route.
 */
export function getJsonLd(pathname: string): object {
  const meta = getRouteMeta(pathname)
  const canonical = absoluteUrl(meta.path === '/404' ? '/404' : meta.path)

  // 1. Organization Schema
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

  // 2. WebSite Schema
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-US',
  }

  // 3. BreadcrumbList Schema (for all routes except home)
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

  // 4. Primary Page Schema
  let primaryEntity: object

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
  if (breadcrumbList) {
    graph.push(breadcrumbList)
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

/**
 * Client-side React hook to update DOM <head> tags on navigation.
 * Updates document.title, meta description, canonical, Open Graph, Twitter, and robots.
 */
export function useSeo(pathname: string): void {
  useEffect(() => {
    if (typeof document === 'undefined') return

    const meta = getRouteMeta(pathname)
    const canonicalUrl = absoluteUrl(meta.path === '/404' ? '/404' : meta.path)

    // 1. Title
    document.title = meta.title

    // Helper to create or update meta tags
    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    // 2. Primary Meta Tags
    setMeta('name', 'description', meta.description)
    setMeta('name', 'robots', meta.indexable ? 'index, follow' : 'noindex, nofollow')

    // 3. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

    // 4. Open Graph Meta Tags
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:type', meta.path === '/learn' ? 'article' : 'website')
    setMeta('property', 'og:image', `${SITE_URL}/og-image.png`)
    setMeta('property', 'og:image:width', '1200')
    setMeta('property', 'og:image:height', '630')
    setMeta('property', 'og:image:alt', `${SITE_NAME} - ${SITE_TAGLINE}`)

    // 5. Twitter Card Meta Tags
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', meta.title)
    setMeta('name', 'twitter:description', meta.description)
    setMeta('name', 'twitter:url', canonicalUrl)
    setMeta('name', 'twitter:image', `${SITE_URL}/og-image.png`)

    // 6. JSON-LD Script
    let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.setAttribute('type', 'application/ld+json')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(getJsonLd(meta.path))
  }, [pathname])
}
