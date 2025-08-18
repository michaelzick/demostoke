import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlRendererProps {
  html: string;
  className?: string;
  textColor?: string;
}

const SafeHtmlRenderer: React.FC<SafeHtmlRendererProps> = ({ html, className = "", textColor = "text-foreground" }) => {
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

  // Convert textColor class to prose modifier format
  const getProseTextClass = (textColor: string) => {
    if (textColor === 'text-muted-foreground') {
      return 'prose-headings:text-muted-foreground prose-p:text-muted-foreground prose-strong:text-muted-foreground prose-em:text-muted-foreground prose-blockquote:text-muted-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:text-muted-foreground prose-code:text-muted-foreground';
    }
    return 'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-blockquote:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-code:text-foreground';
  };

  return (
    <div
      className={`prose prose-lg max-w-none ${getProseTextClass(textColor)} prose-a:text-primary ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SafeHtmlRenderer;
