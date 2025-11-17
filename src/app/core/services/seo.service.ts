import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SeoMetadata, SeoImageConfig, StructuredData } from '../models/seo.model';

const SITE_URL = 'https://www.bunnysballoons.com';
const DEFAULT_IMAGE: SeoImageConfig = {
  url: `${SITE_URL}/arch-1.jpg`,
  alt: "Organic balloon installation designed by Bunny's Balloons"
};
const DEFAULT_KEYWORDS = [
  "Bunny's Balloons",
  'balloon stylist Belleville Michigan',
  'Detroit metro balloon garlands',
  'event installs Detroit',
  'organic balloon arches Michigan',
  'luxury balloon designer'
];
const DEFAULT_ROBOTS = 'index,follow';
const JSON_LD_ELEMENT_ID = 'structured-data';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly meta: Meta,
    private readonly title: Title
  ) {}

  update(metadata: SeoMetadata): void {
    if (!metadata?.title || !metadata?.description) {
      throw new Error('SEO metadata requires at least a title and description.');
    }

    const canonicalUrl = this.buildCanonicalUrl(metadata.path);
    const keywords = metadata.keywords ?? DEFAULT_KEYWORDS;
    const robots = metadata.robots ?? DEFAULT_ROBOTS;
    const image = metadata.image ?? DEFAULT_IMAGE;
    const type = metadata.type ?? 'website';

    this.title.setTitle(metadata.title);

    this.meta.updateTag({ name: 'description', content: metadata.description });
    this.meta.updateTag({ name: 'keywords', content: keywords.join(', ') });
    this.meta.updateTag({ name: 'robots', content: robots });
    this.meta.updateTag({ name: 'author', content: "Bunny's Balloons" });
    this.meta.updateTag({ property: 'og:title', content: metadata.title });
    this.meta.updateTag({ property: 'og:description', content: metadata.description });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: image.url });
    this.meta.updateTag({ property: 'og:image:alt', content: image.alt });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: metadata.title });
    this.meta.updateTag({ name: 'twitter:description', content: metadata.description });
    this.meta.updateTag({ name: 'twitter:image', content: image.url });
    this.meta.updateTag({ name: 'twitter:image:alt', content: image.alt });

    this.setCanonicalLink(canonicalUrl);
    this.setStructuredData(metadata.structuredData);
  }

  private buildCanonicalUrl(path?: string): string {
    if (!path) {
      return SITE_URL;
    }

    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${SITE_URL}${normalized}`;
  }

  private setCanonicalLink(url: string): void {
    const head = this.document.head ?? this.document.getElementsByTagName('head')[0];
    if (!head) {
      return;
    }

    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private setStructuredData(structuredData?: StructuredData | StructuredData[]): void {
    const head = this.document.head ?? this.document.getElementsByTagName('head')[0];
    if (!head) {
      return;
    }

    const existing = head.querySelector<HTMLScriptElement>(`script#${JSON_LD_ELEMENT_ID}`);

    if (!structuredData) {
      existing?.remove();
      return;
    }

    const script = existing ?? this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = JSON_LD_ELEMENT_ID;
    script.text = JSON.stringify(structuredData, null, 2);

    if (!existing) {
      head.appendChild(script);
    }
  }
}
