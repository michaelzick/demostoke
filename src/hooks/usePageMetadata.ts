
import { useEffect } from 'react';

export interface PageMetadata {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  schema?: Record<string, any>;
  canonicalUrl?: string;
}

const setMeta = (attr: 'name' | 'property', key: string, value: string) => {
  if (!value) return;
  let element = document.head.querySelector(`meta[${attr}='${key}']`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
};

const setCanonical = (url: string) => {
  if (!url) return;
  let element = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", url);
};

const usePageMetadata = ({ title, description, image, type = 'website', schema, canonicalUrl }: PageMetadata) => {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMeta('property', 'og:title', title);
      setMeta('name', 'twitter:title', title);
    }
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
    }
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', canonicalUrl || window.location.href);
    setMeta('name', 'twitter:url', canonicalUrl || window.location.href);

    if (canonicalUrl) {
      setCanonical(canonicalUrl);
    } else {
      const canonicalElement = document.head.querySelector("link[rel='canonical']");
      canonicalElement?.remove();
    }

    // Handle author from schema
    if (schema && schema.author && schema.author.name) {
      setMeta('name', 'author', schema.author.name);
    }

    const scriptId = 'structured-data';
    let script = document.head.querySelector(`#${scriptId}`) as HTMLScriptElement | null;
    if (schema) {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    } else if (script) {
      script.remove();
    }
  }, [title, description, image, type, schema, canonicalUrl]);
};

export default usePageMetadata;
