
import { useEffect } from 'react';

export interface PageMetadata {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  schema?: Record<string, any>;
}

const setMeta = (attr: 'name' | 'property', key: string, value: string) => {
  if (!value) return;
  console.log(`Setting meta ${attr}="${key}" content="${value}"`);
  let element = document.head.querySelector(`meta[${attr}='${key}']`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
};

const usePageMetadata = ({ title, description, image, type = 'website', schema }: PageMetadata) => {
  useEffect(() => {
    console.log('usePageMetadata called with:', { title, description, image, type, schema });
    
    if (title) {
      document.title = title;
      setMeta('property', 'og:title', title);
    }
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
    }
    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
    }
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', window.location.href);

    // Handle author from schema
    if (schema && schema.author && schema.author.name) {
      console.log('Setting author meta from schema:', schema.author.name);
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
  }, [title, description, image, type, schema]);
};

export default usePageMetadata;
