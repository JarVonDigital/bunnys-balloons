export interface SeoImageConfig {
  url: string;
  alt: string;
}

export interface StructuredData {
  [key: string]: unknown;
}

export interface SeoMetadata {
  /**
   * Readable page title that will also power social previews.
   */
  title: string;
  /**
   * Search-friendly description that summarizes the page intent.
   */
  description: string;
  /**
   * Optional path (relative to the canonical site URL) used for building canonical/OG URLs.
   */
  path?: string;
  /**
   * Keywords help long-tail searches connect to the right page.
   */
  keywords?: string[];
  /**
   * Social preview image metadata.
   */
  image?: SeoImageConfig;
  /**
   * The OpenGraph/Twitter card type.
   */
  type?: string;
  /**
   * Robots instructions enable us to noindex sensitive pages.
   */
  robots?: string;
  /**
   * Optional Schema.org JSON-LD payload.
   */
  structuredData?: StructuredData | StructuredData[];
}
