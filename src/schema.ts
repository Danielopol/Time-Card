import { SITE } from './site';

const absolute = (path: string) => new URL(path, SITE.url).href;

/** A "<" inside JSON could close the script tag early. */
export const json = (value: object) => JSON.stringify(value).replace(/</g, '\\u003c');

export const publisher = {
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: { '@type': 'ImageObject', url: absolute('/apple-touch-icon.png') },
};

export function articleSchema(page: { headline: string; description: string; url: string; published: string; modified: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.headline,
    description: page.description,
    datePublished: page.published,
    dateModified: page.modified,
    mainEntityOfPage: page.url,
    image: absolute('/og.png'),
    inLanguage: 'en-US',
    ...(SITE.owner ? { author: { '@type': 'Person', name: SITE.owner, url: absolute('/about/') } } : {}),
    publisher,
  };
}

/** The trail from Home down to the page. Keep it the same as the visible breadcrumb. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

/** Site-wide entities, for the home page. */
export const siteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.name, inLanguage: 'en-US', publisher: { '@id': `${SITE.url}/#org` } },
    { ...publisher, '@id': `${SITE.url}/#org`, email: SITE.email },
  ],
};
