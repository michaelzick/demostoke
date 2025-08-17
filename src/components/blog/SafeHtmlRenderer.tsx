import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlRendererProps {
  html: string;
  className?: string;
}

const SafeHtmlRenderer: React.FC<SafeHtmlRendererProps> = ({ html, className = "" }) => {
  const sanitizedHtml = useMemo(() => {
    // Configure DOMPurify with strict allowlist of safe HTML tags
    const config = {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'b', 'i', 'u',
        'ul', 'ol', 'li',
        'blockquote',
        'a',
        'span', 'div'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      ALLOW_DATA_ATTR: false,
      FORBID_SCRIPTS: true,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    };

    return DOMPurify.sanitize(html, config);
  }, [html]);

  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      style={{
        // Apply custom styles for heading hierarchy
        '--tw-prose-headings': 'var(--foreground)',
        '--tw-prose-body': 'var(--foreground)',
        '--tw-prose-links': 'var(--primary)',
        '--tw-prose-bold': 'var(--foreground)',
        '--tw-prose-quotes': 'var(--muted-foreground)',
      } as React.CSSProperties}
    />
  );
};

export default SafeHtmlRenderer;
